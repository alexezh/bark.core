import _ from "lodash";
import { ScreenDef } from './ScreenDef';
import { ILevel, TileLevel } from './TileLevel'

export class Screen {
  private _def: ScreenDef;
  private _level: ILevel | undefined = undefined;
  private _canvas: any = undefined;
  private _width: number = 0;
  private _height: number = 0;
  private _cameraX: number = 0;
  private _cameraY: number = 0;
  private _scrollX: number = 0;
  private _editMode: boolean = true;

  public get scrollX() { return this._scrollX; }
  public get width() { return this._width; }
  public get height() { return this._height; }

  public constructor(def: ScreenDef) {
    this._def = def;
    _.bindAll(this, [
      'onScreenChange'
    ]);

    this.onScreenChange();
    this._def.onChange.add(this.onScreenChange)
  }

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

  public onScreenChange() {
    console.log('onScreenChange');

    if (this._width !== this._def.props.screenWidth ||
      this._height !== this._def.props.screenHeight) {

      console.log('update parameters');
      this._width = this._def.props.screenWidth;
      this._height = this._def.props.screenHeight;

      if (this._canvas !== undefined) {
        this._canvas.width = this._width;
        this._canvas.height = this._height;
      }
    }

    if (this._level === undefined && this._def.level !== undefined) {
      console.log('create level');
      this._level = new TileLevel(this._def.level);
    }
  }

  // repaint screen based on current scrolling position
  public _repaint() {
    var ctx = this._canvas.getContext('2d');
    let frameTime = performance.now();
    ctx.save();
    ctx.clearRect(0, 0, this._width, this._height);

    ctx.translate(-this.scrollX, 0);

    if (this._level !== undefined) {
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

  /*
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
  */
}
