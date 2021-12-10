function animationDemo() {
    // this demo displays graphics based sprite and moves it on screen
    let levelMap = new LevelMap();
    levelMap.createEmptyMap(32, 6);

    let lineWidth = new NumberProperty();
    animationManager.li
    function drawSmile(ctx) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#325FA2';
        ctx.arc(0, 0, 16, 16, Math.PI * 2, true);
        ctx.stroke();
    }

    let smile = new Sprite(20, 100, 32, 32, new DynamicImage(drawSmile));
    screen.addSprite(smile);
    screen.setMap(levelMap, { gridWidth: 32, gridHeight: 6, blockWidth: 32, blockHeight: 32 });

    game.onUpdateScene = function () {
        if (input.pressedKeys.ArrowLeft) {
            smile.flipH = true;
            smile.$x.add(-1);
        } 

        if(input.pressedKeys.ArrowRight) {
            smile.flipH = false;
            smile.$x.add(1);
        }

        if(input.pressedKeys.ArrowUp) {
            smile.glideByY(-20);
        } 

        if(input.pressedKeys.ArrowDown) {
            smile.glideByY(20);
        } 
    }
}