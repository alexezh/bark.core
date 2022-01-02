import { IProjectStorage, IStorageOpReceiver } from './ProjectStorage';
import { ObjectDef, IObjectDef } from './ObjectDef';
import { CodeFileDef } from './CodeFileDef';
import { SpriteDef, SpriteDefCollection } from './SpriteDef';
import { TileLevelDef, TileLevelProps } from './TileLevelDef';
import AsyncEventSource from './AsyncEventSource';

export class ScreenDef extends ObjectDef implements IStorageOpReceiver {
  /**
   * collection of all sprites in a game
   */
  private _sprites: SpriteDefCollection = new SpriteDefCollection();
  // @ts-ignore
  private _level: TileLevelDef;
  // @ts-ignore
  private _codeFile: CodeFileDef;

  public get sprites(): SpriteDefCollection { return this._sprites; }
  public get level(): TileLevelDef { return this._level; }
  public get codeFile(): CodeFileDef { return this._codeFile; }
  public readonly onChange: AsyncEventSource<() => void> = new AsyncEventSource<() => void>();

  // @ts-ignore
  public props: {
    screenWidth: number,
    screenHeight: number,
  };

  public constructor(
    storage: IProjectStorage,
    props: {
      screenWidth: number,
      screenHeight: number
    } | undefined = undefined) {

    super(storage, undefined, 'screen');

    this._storage = storage;
    storage.registerReceiver(this.id, this);

    if (props !== undefined) {
      this.props = props;
      this._codeFile = new CodeFileDef(storage, this, undefined, 'game');
      storage.setItem(this.id, undefined, this.createUpdateOp());
    }
  }

  public createLevel(props: TileLevelProps): TileLevelDef {
    this._level = new TileLevelDef(this._storage, this, undefined, props, this._sprites);
    return this.level;
  }

  public processSet(op: any): void {
    this.props = op.props;
  }

  public processAdd(childId: string, op: any): void {
    console.log('processAdd:' + op.target + ' ' + childId);
    if (op.target === 'Sprite') {
      this.sprites.push(SpriteDef.fromOp(this._storage, this, childId, op));
    } else if (op.target === 'TileLevel') {
      this._level = TileLevelDef.fromOp(this._storage, this, childId, this._sprites, op);
    } else {
      this._codeFile = CodeFileDef.fromOp(this._storage, this, childId, op);
    }
  }

  private createUpdateOp() {
    return {
      target: 'Project',
      props: this.props,
    }
  }

  public setSize(screenWidth: number, screenHeight: number) {
    this.props.screenWidth = screenWidth;
    this.props.screenHeight = screenHeight;

    this._storage.setItem('screen', undefined, this.createUpdateOp());
  }

  /**
   * create sprite and adds it to the list
   */
  public createSprite(name: string): SpriteDef {
    let sprite = new SpriteDef(this._storage, this, undefined, name);
    this.sprites.push(sprite);
    return sprite;
  }
}
