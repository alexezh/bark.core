export class SpriteImage2 {
  private _skins: any;
  private _animations: [any];
  private id: Number;
  private flipH: boolean;
  private x: Number;
  private y: Number;
  private w: Number;
  private h: Number;
  private $skin;

  // create sprite object
  // x - x coordinate of sprite
  // y - y coordinate of sprite
  // w - sprite width
  // h - sprite height
  // skins - array of either string resource names or SpriteImage type objects
  // animations - array of functions which initialize animations for this sprite
  //              functions should take sprite as parameter
  public constructor({ source, x, y, w, h, skins, animations }) {
  }
}
