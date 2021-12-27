/// <reference path="input.ts" />
/// <reference path="screen.ts" />
/// <reference path="game.ts" />

namespace bark {
  // globals used by rest of code
  export var game = new Game();
  export var screen = new Screen();
  export var input = new Input();
  export var project: { [id: string]: any } = {};

  export function processEvent(event: any) {
    
  }

  /**
   * called when game is loaded
   */
  export function loadGameFrame(canvas: any) {
    window.addEventListener("message", (event) => {
      processEvent(event);
    }, false);

    game.loadCanvas(canvas);
  }
}