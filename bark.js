// handles keyboard 
const Keys = {
   Up: 'Up',
   Down: 'Down',
   Left: 'Left',
   Right: 'Right',
   Space: 'Space',
};

function Game() {
   this._screen = null;
   this._canvas = null;
   this.onKey = null;
   let self = this;
   window.addEventListener('keydown', (evt) => self.onKeyDown(evt), true);   
}

// runs the game
Game.prototype.run = function(screen) {
   this._screen = screen;
   this.tryRun();
}

Game.prototype.loadCanvas = function(canvas) {
   this._canvas = canvas;
   this.tryRun();
}

Game.prototype.tryRun = function() {
   if(this._screen !== null && this._canvas !== null) {
      this._screen.run(this._canvas);
   }
}

Game.prototype.onKeyDown = function(evt) {
   if (this.onKey === null)
      return;

   switch (evt.keyCode) {
      case 38:  // Up arrow was pressed
         this.onKey(Keys.Up);
         break;
      case 40:  // Down arrow was pressed
         this.onKey(Keys.Down);
         break;
      case 37:  // Left arrow was pressed
         this.onKey(Keys.Left);
         break;
      case 39:  // Right arrow was pressed
         this.onKey(Keys.Right);
         break;
      case 32:  // Space arrow was pressed
         this.onKey(Keys.Space);
         break;
   }
}

let game = new Game();

// called when canvas is loaded
function gameLoaded() {
   var canvas = document.getElementById("canvas");
   game.loadCanvas(canvas);
}

function Screen(w, h) {
   this._width = w;
   this._height = h;
   this._sprites = [];
   this._levelMap = null;
   this._canvas = null;
   this._scrollX = new NumberProperty();

   Object.defineProperty(this, 'scrollX', {
      get() {
        return this._scrollX.get();
      }
    });   

    Object.defineProperty(this, 'width', {
      get() {
        return this._width;
      }
    });   

    Object.defineProperty(this, 'height', {
      get() {
        return this._height;
      }
    });   
}

Screen.prototype.setMap = function(levelMap) {
   this._levelMap = levelMap;
}

Screen.prototype.run = function(canvas) {
   this._canvas = canvas;
   canvas.width = this._width;
   canvas.height = this._height;

   let self = this;
   window.requestAnimationFrame(() => self._repaint());
}

// repaint screen based on current scrolling position
Screen.prototype._repaint = function() {
   var ctx = this._canvas.getContext('2d');
   let frameTime = performance.now();
   ctx.save();
   ctx.clearRect(0, 0, this._width, this._height);

   ctx.translate(-this.scrollX, 0);

   if (this._levelMap !== null) {
      this._levelMap.draw(ctx, 0, this._width);
   }

   this._sprites.forEach(element => {
      element.draw(ctx);
   });
   
   ctx.restore();

   let self = this;
   window.requestAnimationFrame(() => self._repaint());
}

Screen.prototype.addSprite = function(sprite) {
   this._sprites.push(sprite);
}

Screen.prototype.addAnimation = function(animation) {
   this._animations.push(animation);
}

Screen.prototype.scrollByX = function(delta) {
   this._scrollX.add(delta);
}

Screen.prototype.smoothScrollByX = function(delta) {
   this._scrollX.glide(delta, delta / 10);
}

// returns relative position to the left side
Screen.prototype.relativePosX = function(x) {
   return x - this.scrollX;
}


// keeps track of animated property
function LinearAnimatedValue(prop, delta, step) {
   this.prop = prop;
   this.delta = delta;
   this.step = step;
}

LinearAnimatedValue.prototype.animate = function(frameTime) {
   if(this.delta === 0) {
      return false;
   } else if(this.delta > 0) {
      if(this.delta > this.step) {
         this.delta -= this.step;
         this.prop.add(this.step);
         return true;
      } else {
         this.prop.add(this.delta);
         this.delta = 0;
         return false;
      }
   } else {
      if(this.delta < this.step) {
         this.delta -= this.step;
         this.prop.add(this.step);
         return true;
      } else {
         this.prop.add(this.delta);
         this.delta = 0;
         return false;
      }
   }
}

function DiscreteAnimatedValue(prop, value, maxValue, intervalSeconds) {
   this.prop = prop;
   this.value = value;
   this.maxValue = maxValue;
   this.intervalMs = intervalSeconds * 1000;
   this.lastFrameTime = performance.now();
}

DiscreteAnimatedValue.prototype.animate = function(frameTime) {
   if(this.lastFrameTime + this.intervalMs > frameTime)
      return true;

   let newValue = this.value + 1;
   if(newValue >= this.maxValue) 
      newValue = 0;

   this.value = newValue;
   this.prop.set(newValue);
   this.lastFrameTime = frameTime;

   return true;
} 

// animate number properties at fixes interval
function PropertyAnimationManager() {
   this._props = {};
   this._nextKey = 0;

   // run animation on 100 ms
   let self = this;
   window.setInterval(() => self.processAnimation(), 100);
}

PropertyAnimationManager.prototype.animateLinear = function(prop, delta, step) {
   if(this._props[prop.id] !== undefined) {
      return;
   }

   this._props[prop.id] = new LinearAnimatedValue(prop, delta, step);
}

PropertyAnimationManager.prototype.animate = function(prop, animator) {
   if (prop === undefined || animator == undefined) 
      throw "missing required args";

   if(this._props[prop.id] !== undefined) {
      return;
   }

   this._props[prop.id] = animator;
}

PropertyAnimationManager.prototype.nextPropId = function() {
   return this._nextKey++;
}

PropertyAnimationManager.prototype.processAnimation = function() {
   let frameTime = performance.now();
   for(let key in this._props) {
      let prop = this._props[key];
      if(!prop.animate(frameTime)) {
         delete this._props[key];
      }
   }
}

let animationManager = new PropertyAnimationManager();

// number properties which can be animated
function NumberProperty(value) {
   this._value = (value !== undefined) ? value : 0;
   this.id = animationManager.nextPropId();
}

NumberProperty.prototype.glide = function(delta, step) {
   animationManager.animateLinear(this, delta, step);
}

NumberProperty.prototype.add = function(delta) {
   this._value = this._value + delta;
}

NumberProperty.prototype.get = function() {
   return this._value;
}

NumberProperty.prototype.set = function(value) {
   this._value = value;
}

// sprites
function Sprite(x, y, w, h, skins, animate) {
   this._x = new NumberProperty(x);
   this._y = new NumberProperty(y);
   this._w = w;
   this._h = h;
   this._skins = [];
   this._animate = (animate !== undefined) ? animate : false;
   this._currentSkin = new NumberProperty(0);

   Object.defineProperty(this, 'x', {
      get() {
        return this._x.get();
      }
   });   

   Object.defineProperty(this, 'y', {
      get() {
        return this._y.get();
      }
   });   
 
   Object.defineProperty(this, 'currentSkin', {
      get() {
         return this._currentSkin.get();
      },
      set(newValue) {
        return this._currentSkin.set(newValue);
      }
    });   


   if (Array.isArray(skins)) {
      skins.forEach(elem => {
         if(typeof(elem) == 'string') {
            this._skins.push(new SpriteImage(elem, w, h));
         } else {
            // assume that it is something which can draw
            this._skins.push(elem);
         }
      });
   }
   else if(typeof(skins) == 'string') {
      this._skins.push(new SpriteImage(skins, w, h));
   } else {
      // assume that it is something which can draw
      this._skins.push(skins);
   }

   if(this._animate) {
      animationManager.animate(this._currentSkin, new DiscreteAnimatedValue(this._currentSkin, 0, this._skins.length, 1.0));
   }
}

Sprite.prototype.draw = function(ctx) {
   if(this.currentSkin >= this._skins) {
      throw "invalid skin index";
   }

   this._skins[this.currentSkin].draw(ctx, this.x, this.y, this._w, this._h);
}

// executes timer in seconds
Sprite.prototype.setTimer = function(timeout, func) {
   if (typeof(timeout) != 'number')
      throw 'pass timeout as parameter';

   if (timeout < 0.1) {
      timeout = 0.1;
   }
   window.setInterval(func, timeout);
}

Sprite.prototype.setXY = function(x, y) {
   this._x.set(x);
   this._y.set(y);
}

Sprite.prototype.changeX = function(x) {
   this._x.add(x);
}

Sprite.prototype.changeY = function(y) {
   this._y.add(y);
}

Sprite.prototype.changeXY = function(x, y) {
   this._x.add(x);
   this._y.add(y);
}

Sprite.prototype.glideByY = function(y) {
   this._y.glide(y, y / 10);
}

Sprite.prototype.clone = function(x, y) {
   return new Sprite(x, y, this._w, this._h, this._skins, this._animate);
}

Sprite.prototype.getSkinCount = function() {
   return this._skins.length;
}

// SpriteImage is abstraction for atlas vs bitmap images
function SpriteImage(name, w, h) {
   this._image = new Image();
   this._image.src = name;
   this._w = w;
   this._h = h;
}

SpriteImage.prototype.draw = function(ctx, x, y, w, h) {
   ctx.drawImage(this._image, x, y, w, h);
}

// image which can be used instead of actual image
function SpriteAtlasImage(atlas, x, y, w, h) {
   this._image = atlas;
   this._x = x;
   this._y = y;
   this._w = w;
   this._h = h;
}

SpriteAtlasImage.prototype.draw = function(ctx, x, y, w, h) {
   ctx.drawImage(this._image, this._x, this._y, this._w, this._h, x, y, w, h);
}

// atlas
function SpriteAtlas(spriteImageW, spriteImageH, name, spriteW, spriteH) {
   this._image = new Image();
   this._image.src = name;
   this._spriteImageW = spriteImageW;
   this._spriteImageH = spriteImageH;
   this._spriteW = spriteW;
   this._spriteH = spriteH;
}

SpriteAtlas.prototype.createSprite = function(x, y) {
   let spriteImage = new SpriteAtlasImage(
      this._image, 
      x * this._spriteImageW, 
      y * this._spriteImageH, 
      this._spriteImageW,
      this._spriteImageH);

   return new Sprite(0, 0, this._spriteW, this._spriteH, [spriteImage]);
}

SpriteAtlas.prototype.createSpriteAnimated = function(pos, interval) {
   if (!Array.isArray(pos))
      throw "has to be array";
   
   let spriteImages = [];

   for(let i = 0; i < Math.round(pos.length) / 2; i++) {
      spriteImages.push(new SpriteAtlasImage(
         this._image, 
         pos[i*2] * this._spriteImageW, 
         pos[i*2+1] * this._spriteImageH, 
         this._spriteImageW,
         this._spriteImageH));
   }

   let sprite = new Sprite(0, 0, this._spriteW, this._spriteH, spriteImages, true);

   return sprite;
}

let PixelPos = { x: 0, y: 0};

// level map
function LevelMap(blockW, blockH) {
   this._sprites = {};
   this._blockW = blockW;
   this._blockH = blockH;
   this._rows = [];
}

LevelMap.prototype.addSprite = function(c, sprite) {
   this._sprites[c] = sprite;
}

LevelMap.prototype.pixelWidth = function() {
   return this._blockW * this._rows[0].length;
}

LevelMap.prototype.pixelHeight = function() {
   return this._blockH * this._rows.length;
}

LevelMap.prototype.blockWidth = function() {
   return this._blockW;
}

LevelMap.prototype.blockHeight = function() {
   return this._blockH;
}

// load map as row of strings
LevelMap.prototype.loadMap = function(rows) {
   let rowY = 0;
   rows.forEach(inputRow => {
      let spriteRow = [];
      for(let i = 0; i < inputRow.length; i++) {
         c = inputRow[i];
         let sprite = this._sprites[c];
         if(sprite !== undefined) {
            sprite = sprite.clone(i * this._blockH, rowY);
            spriteRow.push(sprite);
         } else {
            spriteRow.push(null);
         }
      };

      this._rows.push(spriteRow);
      rowY += this._blockH;
   });
}

// draw map from position x, y with (w,h) size
LevelMap.prototype.draw = function(ctx, x, w) {
   let startX = x / this._blockW;
   let startOffset = x % this._blockW;
   let endX = startX + w / this._blockW + 1;
   let currentY = 0;
   this._rows.forEach(row => {
      for(let i = startX; i < endX; i++) {
         let sprite = row[i];
         if(sprite !== null) {
            sprite.draw(ctx);
         }
      }

      currentY += this._blockH;
   });
}

LevelMap.prototype.getBlockByPixelPos = function(x, y) {
   let blockPos = this.getBlockByPixelPos(x, y);
   this.getBlockByBlockPos(blockPos.x, blockPos.y);
}

LevelMap.prototype.getBlockByBlockPos = function(x, y) {
   let row = this._rows[blockPos.y];
   if(row === undefined)
      return null;
   return rows[blockPos.x];
}

LevelMap.prototype.getPixelPosByBlockPos = function(x, y) {
   return { x: x * this._blockW, y: y * this._blockH };
}

LevelMap.prototype.getBlockPosByPixelPos = function(x, y) {
   return { x: Math.round(x / this._blockW), y: Math.round(y / this._blockH) };
}

LevelMap.prototype.setBlock = function(x, y, c) {
   let row = this._rows[y];
   if(row === undefined)
      return;

   if (x >= row.length)
      return;

   let sprite = this._sprites[c];
   if(sprite !== undefined) {
      sprite = sprite.clone(x * this._blockH, y * this._blockH);
      row[x] = sprite;
   } else {
      row[x] = null;
   }
}
