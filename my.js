let game = new Game(300, 300);
let screen = new Screen();
game.setScreen(screen);
let mickey = new Sprite(0, 200, 100, 100, "./m.jpg");
screen.addSprite(mickey);

let mickeyJump = new GravityAnimator(mickey);
screen.addAnimation(mickeyJump);

game.onLeft = function () {
   mickey.X = mickey.X - 1;
}
game.onRight = function () {
   mickey.X = mickey.X + 1;
}
game.onUp = function () {
//   mickey.Y = mickey.Y - 1;
    mickeyJump.run(10, -10, 1);
}
game.onDown = function () {
//   mickey.Y = mickey.Y + 1;
}

game.run();