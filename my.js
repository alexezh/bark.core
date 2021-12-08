let game = new Game(300, 300);
let screen = new Screen();
let keyController = new KeyboardController();

// image is from
// https://th.bing.com/th/id/R.5b0f575c42bd86b622fc9a0f8c0e03f6?rik=a4MuV9E59zvOGw&riu=http%3a%2f%2fwww.cis.upenn.edu%2f%7ecis460%2f16fa%2fhw%2fhwMM02%2fminecraft_textures_all_labeled.png&ehk=6hM%2b6OvSC7m7A6cw3%2b5kVaeDFlENHUu1jIQWXr0qBIk%3d&risl=&pid=ImgRaw&r=0
let atlas = new SpriteAtlas(64, 64, './mineatlas.jpg', 32, 32);
let levelMap = new LevelMap(32, 32);
levelMap.addSprite('A', atlas.createSprite(6, 2));
levelMap.addSprite('B', atlas.createSprite(1, 0));
levelMap.addSprite('C', atlas.createSprite(0, 0));
levelMap.addSprite('D', atlas.createSprite(7, 0));
levelMap.loadMap([
   'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
   'D                                  D',
   'D                                  D',
   'D                                  D',
   'D                                  D',
   'D                                  D',
   'CCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAAAA',
]);

game.setScreen(screen);
let mickey = new Sprite(0, 200, 100, 100, ["./m.jpg", "./2.jpg"]);
screen.addSprite(mickey);
screen.setMap(levelMap);

mickey.setTimer(1.0, () => {
//   mickey.currentSkin = (mickey.currentSkin === 0) ? 1 : 0; 
});

keyController.onKey = function (key) {
   if (key === Keys.Left) {
      mickey.moveX(-1);
      screen.scrollByX(-1);
   } else if(key === Keys.Right) {
      mickey.moveX(1);
      if(screen.relativePosX(mickey.x) > 20) {
         screen.smoothScrollByX(20);
      }
   } else if(key === Keys.Up) {
      mickey.moveY(-1);
   } else if(key === Keys.Down) {
      mickey.moveY(1);
   }
}

game.run();