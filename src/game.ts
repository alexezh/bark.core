/// <reference path="input.ts" />
/// <reference path="screen.ts" />
namespace bark {

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
      //      if (this._screen !== null && this._canvas !== null) {
      //        this._screen.run(this._canvas);
      //      }
    }
  }
}