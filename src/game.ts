/// <reference path="input.ts" />
/// <reference path="screen.ts" />
namespace bark {
  //  import { Input } from "./input";
  //  import { Screen } from "./screen";

  export class Game {
    private _screen: Screen | null = null;
    private _canvas: any = null;

    // runs the game
    public run(screen: Screen) {
      this._screen = screen;
      this.tryRun();
    }

    public loadCanvas(canvas: any) {
      this._canvas = canvas;
      this.tryRun();
    }

    private tryRun() {
      if (this._screen !== null && this._canvas !== null) {
        this._screen.run(this._canvas);
      }
    }
  }

  // globals used by rest of code
  export var game = new Game();
  export var screen = new Screen();
  export var input = new Input();
  let gameCode: string = '';
  let isGameLoaded: boolean = false;

  window.addEventListener("message", (event) => {
    gameCode = event.data;
    tryLoadGameCode();
  }, false);

  export function tryLoadGameCode() {
    if (gameCode !== null) {
      eval(gameCode);

      // we assume that code is loaded; start the game
      game.run(screen);
    }
  }

  // called when canvas is loaded
  export function loadGameFrame(body: any) {
    body.innerHtml = '<canvas id="canvas"></canvas>'
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    body.appendChild(canvas);

    game.loadCanvas(canvas);
    isGameLoaded = true;
    tryLoadGameCode();
  }
}