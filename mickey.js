function Game(w, h) {
   this.onDown = null;
   this.onUp = null;
   this.onLeft = null;
   this.onRight = null;

   this.scrollX = 0;
   this._canvas = null;
   this._width = w;
   this._height = h;

   let self = this;
   window.addEventListener('keydown', (evt) => self.onKeyDown(evt), true);   
}

Game.prototype.onKeyDown = function(evt) {
   switch (evt.keyCode) {
      case 38:  // Up arrow was pressed
         if (this.onUp !== null)
            this.onUp();
      break;
      case 40:  // Down arrow was pressed
         if (this.onDown !== null)
            this.onDown();
      break;
      case 37:  // Left arrow was pressed
         if (this.onLeft !== null)
            this.onLeft();
      break;
      case 39:  // Right arrow was pressed
         if (this.onRight !== null)
            this.onRight();
      break;
   }
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

function Screen() {
   this._sprites = [];
   this._animations = [];
}

Screen.prototype.loadMap = function() {
}

Screen.prototype.repaint = function(ctx, frameTime) {
   this._animations.forEach(function(element) {
      element.update(frameTime);
   });

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

function Sprite(x, y, w, h, name) {
   this.X = x;
   this.Y = y;
   this.W = w;
   this.H = h;
   this._image = new Image();
   this._image.src = name;
}

Sprite.prototype.draw = function(ctx) {
   ctx.drawImage(this._image, this.X, this.Y, this.W, this.H);
}

function GravityAnimator(sprite) {
   this._sprite = sprite;
   this._running = false;
   this.speedX = 0;
   this.speedY = 0;
   this.acceleration = 0;
   this.startTime = 0;
   this._running = false;
}

GravityAnimator.prototype.run = function(speedX, speedY, acceleration) {
   this.startTime = performance.now();
   this.speedX = speedX;
   this.speedY = speedY;
   this.startX = this._sprite.X;
   this.startY = this._sprite.Y;
   this.acceleration = acceleration;
   this._running = true;
}

GravityAnimator.prototype.stop = function() {
//   this._running = false;
}

GravityAnimator.prototype.update = function(frameTime) {
   if(!this._running) {
      return;
   }

   let deltaTime = (frameTime - this.startTime) / 1000;
   let speedY = this.speedY + this.acceleration * deltaTime;
   this._sprite.X = this.startX + this.speedX * deltaTime;
   this._sprite.Y = this.startY + this.speedY * deltaTime;
}
