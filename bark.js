function Input() {
   this.pressedKeys = {};

   let self = this;
   window.addEventListener('keydown', (evt) => self.onKeyDown(evt), false);   
   window.addEventListener('keyup', (evt) => self.onKeyUp(evt), false);   
}

Input.prototype.onKeyDown = function(evt) {
   this.pressedKeys[evt.code] = true;
}

Input.prototype.onKeyUp = function(evt) {
   this.pressedKeys[evt.code] = false;
}


// handles keyboard 
function Game() {
   this._screen = null;
   this._canvas = null;
   this.onUpdateScene = null;

   let self = this;
   window.setInterval(() => self.updateScene(), 100);
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

Game.prototype.updateScene = function() {
   if(this.onUpdateScene === null) {
      return;
   }

   return this.onUpdateScene();
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

// goes through list of values in array
function DiscreteAnimatedValue(prop, values, intervalSeconds) {
   if(!Array.isArray(values)) {
      throw "Invalid argument type";
   }
   this.prop = prop;
   this.values = values;
   this.index = 0;
   this.intervalMs = intervalSeconds * 1000;
   this.lastFrameTime = performance.now();
   this.prop.set(this.values[this.index]);
}

DiscreteAnimatedValue.prototype.animate = function(frameTime) {
   if(this.lastFrameTime + this.intervalMs > frameTime)
      return true;

   let newIndex = this.index + 1;
   if(newIndex >= this.values.length) 
      newIndex = 0;

   this.index = newIndex;
   this.prop.set(this.values[newIndex]);
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

let animator = new PropertyAnimationManager();

// number properties which can be animated
function NumberProperty(value) {
   this._value = (value !== undefined) ? value : 0;
   this.id = animator.nextPropId();
}

NumberProperty.prototype.glide = function(delta, step) {
   animator.animateLinear(this, delta, step);
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

// create sprite object
// x - x coordinate of sprite
// y - y coordinate of sprite
// w - sprite width
// h - sprite height
// skins - array of either string resource names or SpriteImage type objects
// animations - array of functions which initialize animations for this sprite
//              functions should take sprite as parameter
function Sprite({ source, x, y, w, h, skins, animations }) {
   this._skins = [];
   this._animations = animations === undefined && source !== undefined ? source._animations : animations;

   this.$flipH = new NumberProperty(false);
   this.$x = new NumberProperty(x === undefined ? source.x : x);
   this.$y = new NumberProperty(y === undefined ? source.y : y);
   this.$w = new NumberProperty(w === undefined ? source.w : w);
   this.$h = new NumberProperty(h === undefined ? source.h : h);
   this.$skin = new NumberProperty(0);

   Object.defineProperty(this, 'x', {
      get() { return this.$x.get(); }
   });   

   Object.defineProperty(this, 'y', {
      get() { return this.$y.get(); }
   });   
 
   Object.defineProperty(this, 'w', {
      get() { return this.$w.get(); }
   });   

   Object.defineProperty(this, 'h', {
      get() { return this.$h.get(); }
   });   

   Object.defineProperty(this, 'flipH', {
      get() { return this.$flipH.get(); },
      set(newValue) { return this.$flipH.set(newValue); }
   });   

   Object.defineProperty(this, 'skin', {
      get() { return this.$skin.get(); },
      set(newValue) { return this.$skin.set(newValue); }
   });   

   skins = skins === undefined ? source._skins : skins;

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

   // TODO: we do not have to run animation for sprites which are not in scene
   if(this._animations !== undefined) {
      this._animations.forEach(a => {
         a(this);
      })
   }
}

Sprite.prototype.draw = function(ctx) {
   if(this.skin >= this._skins.length) {
      throw "invalid skin index";
   }

   let restore = false;
   let x = this.x;
   if(this.flipH) {
      ctx.save();
      ctx.scale(-1, 1);
      x = -x - this._w;
      restore = true;
   }

   this._skins[this.skin].draw(ctx, x, this.y, this.w, this.h);

   if(restore) {
      ctx.restore();
   }
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
   this.$x.set(x);
   this.$y.set(y);
}

Sprite.prototype.clone = function(x, y) {
   let sprite = new Sprite({ source: this, x: x, y: y });
   return sprite;
}

// DynamicImage is abstraction for atlas vs bitmap images
function DynamicImage(func) {
   this._drawFunc = func;
}

DynamicImage.prototype.draw = function(ctx, x, y, w, h) {
   ctx.save();
   ctx.translate(x, y);
   this._drawFunc(ctx);
   ctx.restore();
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

// SpriteAtlasImage is similar to SpriteImage but takes source from atlas
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

// atlas is a set of images combined into a single resource
// provides a way to create individual sprite images
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

   return new Sprite({ x: 0, y: 0, w: this._spriteW, h: this._spriteH, skins: [spriteImage]});
}

SpriteAtlas.prototype.createSpriteAnimated = function(pos, interval) {
   if (!Array.isArray(pos))
      throw "has to be array";
   
   let spriteImages = [];
   let animationSequence = [];

   for(let i = 0; i < Math.round(pos.length) / 2; i++) {
      spriteImages.push(new SpriteAtlasImage(
         this._image, 
         pos[i*2] * this._spriteImageW, 
         pos[i*2+1] * this._spriteImageH, 
         this._spriteImageW,
         this._spriteImageH));

         animationSequence.push(i);
   }

   let animations = [ (sprite) => animator.animate(sprite.$skin, new DiscreteAnimatedValue(sprite.$skin, animationSequence, 1.0)) ];
  
   let sprite = new Sprite({ x: 0, y: 0, w: this._spriteW, h: this._spriteH, skins: spriteImages, animations: animations });

   return sprite;
}

let PixelPos = { x: 0, y: 0};

// LevelMap provides a way to render a map based on set of characters
// each character references sprite registered with addSprite call
function LevelMap() {
   this._sprites = {};
   this._rows = [];
}

LevelMap.prototype.addSprite = function(c, sprite) {
   this._sprites[c] = sprite;
}

LevelMap.prototype.mapSize = function() {
   return { gridHeight: this._rows.length, gridWidth: this._rows[0].length };
}

// create empty map
LevelMap.prototype.createEmptyMap = function(w, h) {
   for(let i = 0; i < h; i++) {
      let row = [];
      for(let j = 0; j < w; j++) {
         row.push(null);
      }
      this._rows.push(row);
   }
}

// load map as row of strings
// each char corresponds to sprite registered with createSprite call
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

LevelMap.prototype.resetMap = function(blockWidth, blockHeight) {
   let rowY = 0;
   this._rows.forEach(row => {
      for(let i = 0; i < row.length; i++) {
         let sprite = row[i];
         if(sprite !== null) {
            sprite.setXY(i * blockWidth, rowY);
         } 
      };

      rowY += blockHeight;
   });
}

// draw map from position x, y with (w,h) size
LevelMap.prototype.draw = function(ctx, x, w, blockW, blockH) {
   let startX = x / blockW;
   let startOffset = x % blockW;
   let endX = startX + w / blockW + 1;
   let currentY = 0;
   this._rows.forEach(row => {
      for(let i = startX; i < endX; i++) {
         let sprite = row[i];
         if(sprite !== undefined && sprite !== null) {
            sprite.draw(ctx);
         }
      }

      currentY += blockH;
   });
}

LevelMap.prototype.getBlock = function(x, y) {
   let row = this._rows[blockPos.y];
   if(row === undefined)
      return null;
   return rows[blockPos.x];
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

LevelMap.prototype.pixelSize = function(blockWidth, blockHeight) {
   return { pixelWidth: blockWidth * this._rows[0].length, pixelHeight: blockHeight * this._rows.length };
}

function Screen() {
   this._width = undefined;
   this._height = undefined;
   this._sprites = [];
   this._levelMap = null;
   this._canvas = null;
   this.$scrollX = new NumberProperty();

   Object.defineProperty(this, 'scrollX', {
      get() { return this.$scrollX.get(); }
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

// screen is a main object of the game
Screen.prototype.setMap = function(levelMap, { gridWidth, gridHeight, blockWidth, blockHeight }) {
   this._levelMap = levelMap;

   if (blockWidth === undefined || blockHeight === undefined) {
      throw "Missing required parameters";
   }

   let mapSize = this._levelMap.mapSize();
   gridWidth = gridWidth === undefined ? mapSize.gridWidth : gridWidth;
   gridHeight = gridHeight === undefined ? mapSize.gridHeight : gridHeight;

   this._blockWidth = blockWidth;
   this._blockHeight = blockHeight;
   this._gridWidth = gridWidth;
   this._gridHeight = gridHeight;
   this._width = this._blockWidth * this._gridWidth;
   this._height = this._blockHeight * this._gridHeight;

   this._levelMap.resetMap(blockWidth, blockHeight);
}

Screen.prototype.run = function(canvas) {
   this._canvas = canvas;
   canvas.width = this._width;
   canvas.height = this._height;
   this._cameraX = undefined;
   this._cameraY = undefined;

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
      this._levelMap.draw(ctx, 0, this._width, this._blockWidth, this._blockHeight);
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

// returns relative position to the left side
Screen.prototype.relativePosX = function(x) {
   return x - this.scrollX;
}

Screen.prototype.pixelSize = function() {
   return { pixelWidth: this._blockWidth * this._rows[0].length, pixelHeight: this._blockHeight * this._rows.length };
}

Screen.prototype.blockSize = function() {
   return { blockWidth: this._blockWidth, blockHeight: this._blockHeight };
}

Screen.prototype.getMapPosByPixelPos = function(x, y) {
   return { gridX: Math.round(x / this._blockWidth), gridY: Math.round(y / this._blockHeight) };
}

// returns block code by position
Screen.prototype.getBlockByPixelPos = function(x, y) {
   let blockPos = this.getBlockByPixelPos(x, y);
   this.getBlock(blockPos.x, blockPos.y);
}

Screen.prototype.getPixelPosByMapPos = function(x, y) {
   return { x: x * this._blockWidth, y: y * this._blockHeight };
}

Screen.prototype.setCamera = function(x, y) {

   // ignore boundary if undefined
   if(this._cameraX !== undefined) {
      let shiftX = 0;

      if(x > this._cameraX) {
         if(this.relativePosX(x) > screen.width * 3 / 4) {
            shiftX = this.width / 2;
         }
      }

      if(x < this._cameraX) {
         if(this.relativePosX(x) > this.width * 3 / 4) {
            shiftX = -this.width / 2;
         }
      }

      let mapPixelSize = this._levelMap.pixelSize();
      if(this.$scrollX + shiftX > mapPixelSize.pixelWidth - this._width) {
         shiftX = mapPixelSize.pixelWidth - this._width - this.$scrollX;
      }

      if(shiftX !== 0) {
         this.$scrollX.glide(shiftX, shiftX / 10);
      }
   }

   this._cameraX = x;
   this._cameraY = y;
}

// globals used by rest of code
let game = new Game();
let screen = new Screen();
let input = new Input();
let gameCode = null;
let isGameLoaded = false;

window.addEventListener("message", (event) => {
   gameCode = event.data;
   tryLoadGameCode();
}, false);

function tryLoadGameCode() {
   if(gameCode !== null) {
      window.eval(gameCode);

      // we assume that code is loaded; start the game
      game.run(screen);
   }
}

// called when canvas is loaded
function loadGameFrame(body) {
   body.innerHtml = '<canvas id="canvas"></canvas>'
   var canvas = document.createElement('canvas');
   canvas.id = 'canvas';
   body.appendChild(canvas);

   game.loadCanvas(canvas);
   isGameLoaded = true;
   tryLoadGameCode();
}

