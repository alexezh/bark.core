
// image is from
// https://th.bing.com/th/id/R.5b0f575c42bd86b622fc9a0f8c0e03f6?rik=a4MuV9E59zvOGw&riu=http%3a%2f%2fwww.cis.upenn.edu%2f%7ecis460%2f16fa%2fhw%2fhwMM02%2fminecraft_textures_all_labeled.png&ehk=6hM%2b6OvSC7m7A6cw3%2b5kVaeDFlENHUu1jIQWXr0qBIk%3d&risl=&pid=ImgRaw&r=0
let atlas = new SpriteAtlas(64, 64, './mineatlas.jpg', 32, 32);
let levelMap = new LevelMap(32, 32);
levelMap.addSprite('A', atlas.createSprite(6, 2));
levelMap.addSprite('B', atlas.createSprite(1, 0));
levelMap.addSprite('C', atlas.createSprite(0, 0));
levelMap.addSprite('D', atlas.createSprite(7, 0));
levelMap.addSprite('G', atlas.createSpriteAnimated([12, 5, 13, 5], 1));
levelMap.loadMap([
   'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
   'D                                  D',
   'D                                  D',
   'D                                  D',
   'D                                  D',
   'D GGGGG                            D',
   'CCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAAAA',
]);

let screen = new Screen(levelMap.blockHeight() * 20, levelMap.pixelHeight());

let mickey = new Sprite(0, 200, 32, 32, ["./2.jpg"]);
screen.addSprite(mickey);
screen.setMap(levelMap);

mickey.setTimer(1.0, () => {
//   mickey.currentSkin = (mickey.currentSkin === 0) ? 1 : 0; 
});

game.onUpdateScene = function () {
   if (game.pressedKeys.ArrowLeft) {
      mickey.changeX(-1);
      screen.scrollByX(-1);
   } 
   
   if(game.pressedKeys.ArrowRight) {
      mickey.changeX(1);
      if(screen.relativePosX(mickey.x) > screen.width / 3) {
         screen.smoothScrollByX(screen.width / 3);
      }
   }
   
   if(game.pressedKeys.ArrowUp) {
      mickey.glideByY(-20);
   } 
   
   if(game.pressedKeys.ArrowDown) {
      mickey.changeY(1);
   } 
   
   if(game.pressedKeys.Space) {
      let blockPos = levelMap.getBlockPosByPixelPos(mickey.x, mickey.y);
      levelMap.setBlock(blockPos.x + 1, blockPos.y, 'T');
   }
}

game.run(screen);