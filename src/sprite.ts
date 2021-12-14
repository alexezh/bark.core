//import { animator } from './animator';
//import { ISpriteSource, SpriteImage } from './spriteSource';

/// <reference path="animator.ts" />
/// <reference path="spriteSource.ts" />

namespace bark {
  export class Sprite {
    private _skins: any = [];
    private _animations: any[];
    private id: number;
    private flipH: boolean;
    private x: number;
    private y: number;
    private w: number;
    private h: number;
    public skin: number = 0;

    public get top() { return this.y; }
    public set top(newValue) { this.y = newValue; }

    public get bottom() { return this.y + this.h; }
    public set bottom(newValue) { this.y = newValue - this.h; }

    public get left() { return this.x; }
    public set left(newValue) { this.x = newValue; }

    public get right() { return this.x + this.w; }
    public set right(newValue) { this.x = newValue - this.w; }


    // create sprite object
    // x - x coordinate of sprite
    // y - y coordinate of sprite
    // w - sprite width
    // h - sprite height
    // skins - array of either string resource names or SpriteImage type objects
    // animations - array of functions which initialize animations for this sprite
    //              functions should take sprite as parameter
    public constructor(args: {
      source?: Sprite,
      x?: number,
      y?: number,
      w?: number,
      h?: number,
      skins?: any[],
      animations?: any[]
    }) {
      this.id = animator.nextId();
      this._animations = ((args.animations === undefined && args.source !== undefined) ? args.source._animations : args.animations) as any[];

      this.id = animator.nextId();
      this.flipH = false;
      this.x = (args.x === undefined && args.source !== undefined ? args.source.x : args.x) as number;
      this.y = (args.y === undefined && args.source !== undefined ? args.source.y : args.y) as number;
      this.w = (args.w === undefined && args.source !== undefined ? args.source.w : args.w) as number;
      this.h = (args.h === undefined && args.source !== undefined ? args.source.h : args.h) as number;

      args.skins = (args.skins === undefined && args.source !== undefined) ? args.source._skins : args.skins;

      this.initSkins(args.skins);
    }

    private initSkins(skins?: any[]) {
      if (Array.isArray(skins)) {
        skins.forEach(elem => {
          if (typeof (elem) == 'string') {
            this._skins.push(new SpriteImage(elem, this.w, this.h));
          } else {
            // assume that it is something which can draw
            this._skins.push(elem);
          }
        });
      }
      else if (typeof (skins) === 'string') {
        this._skins.push(new SpriteImage(skins as string, this.w, this.h));
      } else {
        // assume that it is something which can draw
        this._skins.push(skins);
      }

      // TODO: we do not have to run animation for sprites which are not in scene
      if (this._animations !== undefined) {
        this._animations.forEach(a => {
          a(this);
        })
      }
    }

    public draw(ctx: any) {
      if (this.skin >= this._skins.length) {
        throw "invalid skin index";
      }

      let restore = false;
      let x = this.x;
      if (this.flipH) {
        ctx.save();
        ctx.scale(-1, 1);
        x = -x - this.w;
        restore = true;
      }

      this._skins[this.skin].draw(ctx, x, this.y, this.w, this.h);

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
      this.x = x;
      this.y = y;
    }

    public clone(x: number, y: number): Sprite {
      let sprite = new Sprite({ source: this, x: x, y: y });
      return sprite;
    }
  }
}
