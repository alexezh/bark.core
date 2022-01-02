export * from './help';
export * from './CostumeDef';
export * from './CodeFileDef';
export * from './ScreenDef';
export * from './TileLevelDef';
export * from './Project';
export * from './game';
export * from './Screen';
export * from './Sprite';
export * from './SpriteSource';
export * from './input';
export * from './IProjectStorage';
export * from './ProjectStorage';
export * from './TileLevel';
export * from './SpriteDef';

export class Help2 {
  private _content: { [key: string]: string } = {};

  public add(key: string, content: string) {
    this._content[key] = content;
  }
}
