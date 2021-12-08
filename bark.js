function Game(w, h) {
   this.scrollX = 0;
   this._canvas = null;
   this._width = w;
   this._height = h;
}

Game.prototype.setScreen = function(screen) {
   this._screen = screen;
}

Game.prototype.scroll = function(x) {
}

Game.prototype.run = function() {
   let self = this;
   window.requestAnimationFrame(() => self.repaint());
}

Game.prototype.repaint = function() {
   var canvas = document.getElementById("game");
   var ctx = canvas.getContext('2d');
   let frameTime = performance.now();
   ctx.save();
   ctx.clearRect(0, 0, this._width, this._height);
   this._screen.repaint(ctx, frameTime);
   ctx.restore();
   let self = this;
   window.requestAnimationFrame(() => self.repaint());
}

const Keys = {
   Up: 'Up',
   Down: 'Down',
   Left: 'Left',
   Right: 'Right'
};

function KeyboardController() {
   this.onKey = null;
   let self = this;
   window.addEventListener('keydown', (evt) => self.onKeyDown(evt), true);   
}

KeyboardController.prototype.onKeyDown = function(evt) {
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
   }
}

// screen holds sprites and level map
function Screen() {
   this._sprites = [];
   this._levelMap = null;
}

Screen.prototype.setMap = function(levelMap) {
   this._levelMap = levelMap;
}

Screen.prototype.repaint = function(ctx, frameTime) {
   this._levelMap.draw(ctx, 0, );

   this._sprites.forEach(element => {
      element.draw(ctx);
   });
}

Screen.prototype.addSprite = function(sprite) {
   this._sprites.push(sprite);
}

Screen.prototype.addAnimation = function(animation) {
   this._animations.push(animation);
}

// sprites
function Sprite(x, y, w, h, skins) {
   this.x = x;
   this.y = y;
   this.w = w;
   this.h = h;
   this._skins = [];
   this.currentSkin = 0;

   if (Array.isArray(skins)) {
      skins.forEach(elem => {
         if(typeof(elem) == 'string') {
            this._skins.push(new SpriteImage(name, w, h));
         } else {
            // assume that it is something which can draw
            this._skins.push(elem);
         }
      });
   }
   else if(typeof(skins) == 'string') {
      this._skins.push(new SpriteImage(name, w, h));
   } else {
      // assume that it is something which can draw
      this._skins.push(skins);
   }
}

Sprite.prototype.draw = function(ctx) {
   this._skins[this.currentSkin].draw(ctx, this.x, this.y, this.w, this.h);
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

Sprite.prototype.moveX = function(x) {
   this.x += x;
}

Sprite.prototype.moveY = function(y) {
   this.y += y;
}

Sprite.prototype.moveXY = function(x, y) {
   this.x += x;
   this.y += y;
}

// SpriteImage is abstraction for atlas vs bitmap images
function SpriteImage(name, w, h) {
   this._image = new Image();
   this._image.src = name;
   this._w = w;
   this._h = h;
}

SpriteImage.prototype.draw = function(ctx, x, y, w, h) {
   ctx.drawImage(this.SpriteImage, x, y, w, h);
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

// level map
function LevelMap(mapW, mapH, blockW, blockH) {
   this._sprites = {};
   this._w = w;
   this._h = h;
   this._blockW = blockW;
   this._blockH = blockH;
   this._rows = [];
}

LevelMap.prototype.addSprite = function(c, sprite) {
   this._sprites[c] = sprite;
}

// load map as row of strings
LevelMap.prototype.loadMap = function(rows) {
   rows.forEach(inputRow => {
      let spriteRow = [];
      inputRow.forEach(c => {
         let sprite = this._sprites[c];
         if(sprite !== undefined) {
            spriteRow.push(sprite);
         } else {
            spriteRow.push(null);
         }
      });

      this._rows.push(spriteRow);
   });
}

// draw map from position x, y with (w,h) size
LevelMap.prototype.draw = function(ctx, x, w) {
   let startX = x / this._spriteW;
   let startOffset = x % this._spriteW;
   let endX = startX + w / this._spriteW + 1;
   let currentY = 0;
   this._rows.forEach(row => {
      for(let i = startX; i < endX; i++) {
         let sprite = row[i];
         if(sprite !== null) {
            sprite.draw(ctx, i * this.spriteW + startOffset, currentY);
         }
      }

      currentY += this._spriteH;
   });
}