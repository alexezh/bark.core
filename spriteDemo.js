function spriteDemo() {
   // image is from
   // https://th.bing.com/th/id/R.5b0f575c42bd86b622fc9a0f8c0e03f6?rik=a4MuV9E59zvOGw&riu=http%3a%2f%2fwww.cis.upenn.edu%2f%7ecis460%2f16fa%2fhw%2fhwMM02%2fminecraft_textures_all_labeled.png&ehk=6hM%2b6OvSC7m7A6cw3%2b5kVaeDFlENHUu1jIQWXr0qBIk%3d&risl=&pid=ImgRaw&r=0
   let atlas = new SpriteAtlas(64, 64, './mineatlas.jpg', 32, 32);
   let levelMap = new LevelMap();
   levelMap.addSprite('A', atlas.createSprite({ x: 6, y: 2}));
   levelMap.addSprite('B', atlas.createSprite({ x: 1, y: 0}));
   levelMap.addSprite('C', atlas.createSprite({ x: 0, y: 0}));
   levelMap.addSprite('D', atlas.createSprite({ x: 7, y: 0, 
      animations: [(sprite) => animator.animate(sprite.$x, new LoopLinearAnimator(sprite.$x, 2.0, 0.1))]}));   
//   levelMap.addSprite('D', atlas.createSprite({ x: 7, y: 0}));
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

   screen.setMap(levelMap, { gridWidth: 20, blockWidth: 32, blockHeight: 32 });

   let mickey = new Sprite({ w: 32, h: 32, skins: ["./2.jpg"]});
   screen.addSprite(mickey, screen.getPixelPosByMapPos(5, 4));

   mickey.setTimer(1.0, () => {
   //   mickey.skin = (mickey.skin === 0) ? 1 : 0; 
   });

   let speedX = 0;

   game.onUpdateScene = function () {
      if (input.pressedKeys.ArrowLeft) {

         if(speedX > 0) speedX = 0;
         speedX -= 1;
         if(speedX < -4) speedX = -4;

         mickey.flipH = true;
         mickey.$x.add(speedX);
      } 
      
      if(input.pressedKeys.ArrowRight) {
         if(speedX < 0) speedX = 0;
         speedX += 1;
         if(speedX > 4) speedX = 4;

         mickey.$x.add(speedX);
         mickey.flipH = false;
      }
      
      if(input.pressedKeys.ArrowUp) {
         mickey.$y.glide(-20, -2);
      } 
      
      if(input.pressedKeys.ArrowDown) {
         mickey.$y.add(1);
      } 
      
      if(input.pressedKeys.Space) {
         let blockPos = screen.getMapPosByPixelPos(mickey.x, mickey.y);
         levelMap.setBlock(blockPos.gridX + 1, blockPos.gridY, 'T');
      }

      screen.setCamera(mickey.x, mickey.y);
   }
}