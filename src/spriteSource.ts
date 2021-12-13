export interface ISpriteSource {
  draw(ctx: any, x: number, y: number, w: number, h: number): void;

}

export class SpriteImage implements ISpriteSource {
  private _w: number;
  private _h: number;
  private _image: any;

  // create sprite object
  // x - x coordinate of sprite
  // y - y coordinate of sprite
  // w - sprite width
  // h - sprite height
  // skins - array of either string resource names or SpriteImage type objects
  // animations - array of functions which initialize animations for this sprite
  //              functions should take sprite as parameter
  public constructor(name: string, w: number, h: number) {
    this._image = new Image();
    this._image.src = name;
    this._w = w;
    this._h = h;
  }

  public draw(ctx: any, x: number, y: number, w: number, h: number): void {
    ctx.drawImage(this._image, x, y, w, h);
  }
}

// DynamicImage is abstraction for atlas vs bitmap images
export class DynamicImage implements ISpriteSource {
  private _drawFunc: any;

  constructor(func: any) {
    this._drawFunc = func;
  }

  public draw(ctx: any, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.translate(x, y);
    this._drawFunc(ctx);
    ctx.restore();
  }
}
