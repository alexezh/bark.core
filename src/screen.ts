/// <reference path="animator.ts" />
/// <reference path="tilelevel.ts" />

namespace bark {
  export class Screen {
    private _width: number = 0;
    private _height: number = 0;
    private _level: ILevel | null = null;
    private _canvas: any = null;
    private _cameraX: number = 0;
    private _cameraY: number = 0;
    private _scrollX: number = 0;
    private _editMode: boolean = true;

    public get scrollX() { return this._scrollX; }
    public get width() { return this._width; }
    public get height() { return this._height; }

    // screen is a main object of the game
    public setLevel(level: ILevel) {
      this._level = level;
    }

    public setCanvas(canvas: any) {
      this._canvas = canvas;
      canvas.width = this._width;
      canvas.height = this._height;
      this._cameraX = 0;
      this._cameraY = 0;

      let self = this;
      window.requestAnimationFrame(() => self._repaint());
    }

    public setEditMode(edit: boolean) {
      this._editMode = edit;
      this._level?.setEditMode(edit);
    }

    public resize(screenWidth: number, screenHeight: number) {
      this._canvas.width = screenWidth;
      this._canvas.height = screenHeight;
    }

    // repaint screen based on current scrolling position
    public _repaint() {
      var ctx = this._canvas.getContext('2d');
      let frameTime = performance.now();
      ctx.save();
      ctx.clearRect(0, 0, this._width, this._height);

      ctx.translate(-this.scrollX, 0);

      if (this._level !== null) {
        this._level.draw(ctx, 0, this._width);
      }

      ctx.restore();

      let self = this;
      window.requestAnimationFrame(() => self._repaint());
    }

    // returns relative position to the left side
    public relativePosX(x: number) {
      return x - this.scrollX;
    }

    public setCamera(x: number, y: number) {
      if (this._level === null) {
        return;
      }

      // ignore boundary if undefined
      if (this._cameraX !== undefined) {
        let shiftX = 0;

        if (x > this._cameraX) {
          if (this.relativePosX(x) > screen.width * 3 / 4) {
            shiftX = this.width / 2;
          }
        }

        if (x < this._cameraX) {
          if (this.relativePosX(x) > this.width * 3 / 4) {
            shiftX = -this.width / 2;
          }
        }

        if (this.scrollX + shiftX > this._level.pixelWidth - this._width) {
          shiftX = this._level.pixelWidth - this._width - this.scrollX;
        }

        if (shiftX !== 0) {
          //this.$scrollX.glide(shiftX, shiftX / 10);
          this._scrollX -= shiftX;
        }
      }

      this._cameraX = x;
      this._cameraY = y;
    }
  }
}
