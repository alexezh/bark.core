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

function Screen() {
   this._sprites = [];
   this._timers = [];
}

Screen.prototype.loadMap = function() {
}

Screen.prototype.repaint = function(ctx, frameTime) {
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

   skins.forEach(name => {
      let image = new Image();
      image.src = name;
      this._skins.push(image);
   });
}

Sprite.prototype.draw = function(ctx) {
   ctx.drawImage(this._skins[this.currentSkin], this.x, this.y, this.w, this.h);
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
