import { SpriteDef } from './SpriteDef';
import { animator } from './animator';
import { ISpriteSource, SpriteImage } from './SpriteSource';

export type SpriteProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  flipH: boolean;
};

export class Sprite {
  private _def: SpriteDef;
  private _costumeIndex: number;
  private id: number;
  private props: SpriteProps;

  public get top() { return this.props.y; }
  public set top(newValue) { this.props.y = newValue; }

  public get bottom() { return this.props.y + this.props.h; }
  public set bottom(newValue) { this.props.y = newValue - this.props.h; }

  public get left() { return this.props.x; }
  public set left(newValue) { this.props.x = newValue; }

  public get right() { return this.props.x + this.props.w; }
  public set right(newValue) { this.props.x = newValue - this.props.w; }


  // create sprite object
  // x - x coordinate of sprite
  // y - y coordinate of sprite
  // w - sprite width
  // h - sprite height
  // skins - array of either string resource names or SpriteImage type objects
  // animations - array of functions which initialize animations for this sprite
  //              functions should take sprite as parameter
  public constructor(def: SpriteDef, props: SpriteProps) {
    this._def = def;
    this.id = animator.nextId();
    this.props = props;

    this._costumeIndex = 0;
  }

  public draw(ctx: any) {
    if (this._costumeIndex >= this._def.costumes.length) {
      throw "invalid skin index";
    }

    let restore = false;
    let x = this.props.x;
    if (this.props.flipH) {
      ctx.save();
      ctx.scale(-1, 1);
      x = -x - this.props.w;
      restore = true;
    }

    this._def.costumes[this._costumeIndex].getSpriteSource().draw(ctx, x, this.props.y, this.props.w, this.props.h);

    if (restore) {
      ctx.restore();
    }
  }

  // executes timer in seconds
  public setTimer(timeout: number, func: any) {
    if (typeof (timeout) != 'number')
      throw 'pass timeout as parameter';

    if (timeout < 0.1) {
      timeout = 0.1;
    }
    window.setInterval(func, timeout);
  }

  public setXY(x: number, y: number) {
    this.props.x = x;
    this.props.y = y;
  }
}
