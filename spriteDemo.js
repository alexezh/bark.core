function spriteDemo() {
   // image is from
   // https://th.bing.com/th/id/R.5b0f575c42bd86b622fc9a0f8c0e03f6?rik=a4MuV9E59zvOGw&riu=http%3a%2f%2fwww.cis.upenn.edu%2f%7ecis460%2f16fa%2fhw%2fhwMM02%2fminecraft_textures_all_labeled.png&ehk=6hM%2b6OvSC7m7A6cw3%2b5kVaeDFlENHUu1jIQWXr0qBIk%3d&risl=&pid=ImgRaw&r=0
   let atlas = new SpriteAtlas(64, 64, './mineatlas.jpg', 32, 32);
   let levelMap = new LevelMap();
   levelMap.addSprite('A', atlas.createSprite({ x: 6, y: 2}));
   levelMap.addSprite('B', atlas.createSprite({ x: 1, y: 0}));
   levelMap.addSprite('C', atlas.createSprite({ x: 0, y: 0}));
//   levelMap.addSprite('D', atlas.createSprite({ x: 7, y: 0, 
//      animations: [(sprite) => animator.animate(sprite.$x, new LoopLinearAnimator(sprite.$x, 2.0, 0.1))]}));   
   levelMap.addSprite('D', atlas.createSprite({ x: 7, y: 0}));
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
   mickey.speedX = 0;
   mickey.speedY = 0;
   screen.addSprite(mickey, screen.getPixelPosByMapPos(5, 4));

   mickey.setTimer(1.0, () => {
   //   mickey.skin = (mickey.skin === 0) ? 1 : 0; 
   });

   function moveMickey() {
      if (input.pressedKeys.ArrowLeft) {
         if(mickey.speedX > 0) mickey.speedX = 0;
         mickey.speedX -= 1;
         if(mickey.speedX < -4) mickey.speedX = -4;
      } else if(input.pressedKeys.ArrowRight) {
         if(mickey.speedX < 0) mickey.speedX = 0;
         mickey.speedX += 1;
         if(mickey.speedX > 4) mickey.speedX = 4;
      } else {
         mickey.speedX = 0;
      }

      if(mickey.speedX == 0) {
         // nothing to do
      } else if(mickey.speedX > 0) {
         mickey.flipH = true;
      } else {
         mickey.flipH = false;
//         let leftTile = screen.lookLeft(mickey.x, mickey.y);
//         if(leftTile.right() > mickey.left())
      }

      mickey.x += mickey.speedX;

      mickey.speedY = 0;
      if(input.pressedKeys.ArrowUp) {
         animator.glide({obj: mickey, prop: "y", delta: -20, step: -2});
         mickey.speedY = -1;
      } 
      
      if(input.pressedKeys.ArrowDown) {
         mickey.y += 1;
         mickey.speedY = 1;
      } 
   }

   // called after animations completed
   animator.onUpdateScene = function () {
      moveMickey();
      
      // see if mickey is falling. only fall if we are not moving up
      if(mickey.speedY == 0) {
         let below = screen.lookDown(mickey.left, mickey.bottom);
         if(below !== null && mickey.bottom < below.top - 1) {
            mickey.top += 2;
         }
      }

      if(input.pressedKeys.Space) {
         let blockPos = screen.getMapPosByPixelPos(mickey.x, mickey.y);
         levelMap.setBlock(blockPos.gridX + 1, blockPos.gridY, 'T');
      }

      screen.setCamera(mickey.x, mickey.y);
   }
}