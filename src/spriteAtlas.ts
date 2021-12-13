import { ISpriteSource } from './spriteSource';
import { Sprite } from './sprite';
import { animator, DiscreteAnimator } from './animator';

// SpriteAtlasImage is similar to SpriteImage but takes source from atlas
export class SpriteAtlasImage implements ISpriteSource {
  private _x: number;
  private _y: number;
  private _w: number;
  private _h: number;
  private _image: any;

  constructor(atlas, x, y, w, h) {
    this._image = atlas;
    this._x = x;
    this._y = y;
    this._w = w;
    this._h = h;
  }

  public draw(ctx: any, x: number, y: number, w: number, h: number): void {
    ctx.drawImage(this._image, this._x, this._y, this._w, this._h, x, y, w, h);
  }
}

// atlas is a set of images combined into a single resource
// provides a way to create individual sprite images
export class SpriteAtlas {
  private _image: any;
  private _spriteImageW: number;
  private _spriteImageH: number;
  private _spriteW: number;
  private _spriteH: number;

  public constructor(spriteImageW, spriteImageH, name, spriteW, spriteH) {
    this._image = new Image();
    this._image.src = name;
    this._spriteImageW = spriteImageW;
    this._spriteImageH = spriteImageH;
    this._spriteW = spriteW;
    this._spriteH = spriteH;
  }

  public createSprite({ x, y, animations }): Sprite {
    let spriteImage = new SpriteAtlasImage(
      this._image,
      x * this._spriteImageW,
      y * this._spriteImageH,
      this._spriteImageW,
      this._spriteImageH);

    return new Sprite({ x: 0, y: 0, w: this._spriteW, h: this._spriteH, skins: [spriteImage], animations });
  }

  public createSpriteAnimated = function (pos, interval) {
    if (!Array.isArray(pos))
      throw "has to be array";

    let spriteImages = [];
    let animationSequence: number[] = [];

    for (let i = 0; i < Math.round(pos.length) / 2; i++) {
      spriteImages.push(new SpriteAtlasImage(
        this._image,
        pos[i * 2] * this._spriteImageW,
        pos[i * 2 + 1] * this._spriteImageH,
        this._spriteImageW,
        this._spriteImageH));

      animationSequence.push(i);
    }

    let animations = [(sprite) => animator.animate(sprite.skin, new DiscreteAnimator(sprite.$skin, animationSequence, 1.0))];

    let sprite = new Sprite({ x: 0, y: 0, w: this._spriteW, h: this._spriteH, skins: spriteImages, animations: animations });

    return sprite;
  }
}