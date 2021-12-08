let game = new Game(300, 300);
let screen = new Screen();
let keyController = new KeyboardController();

let atlas = new SpriteAtlas(64, 64, './mineatlas.jpg', 32, 32);
let levelMap = new LevelMap();

/*
levelMap.addSprite('A', atlas.createSprite(0, 0));
levelMap.addSprite('B', atlas.createSprite(1, 0));
levelMap.addSprite('C', atlas.createSprite(2, 0));
levelMap.loadMap([
   'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
   'BBBBBBBBBBBBBBBBBAAAAAAAAAAAAAAAAAAA',
   'CCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAAAA',
]);
*/

game.setScreen(screen);
//let mickey = new Sprite(0, 200, 100, 100, ["./m.jpg", "./2.jpg"]);
let mickey = atlas.createSprite(0, 0);
screen.addSprite(mickey);

mickey.setTimer(1.0, () => {
//   mickey.currentSkin = (mickey.currentSkin === 0) ? 1 : 0; 
});

keyController.onKey = function (key) {
   if (key === Keys.Left) {
      mickey.moveX(-1);
   } else if(key === Keys.Right) {
      mickey.moveX(1);
   } else if(key === Keys.Up) {
      mickey.moveY(-1);
   } else if(key === Keys.Down) {
      mickey.moveY(1);
   }
}

game.run();