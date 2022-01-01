import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';
import { ObjectDef, IObjectDef } from './objectDef';
import { CodeFileDef } from './codeFileDef';
import { SpriteDef, SpriteDefCollection } from './SpriteDef';
import { TileLevelDef, TileLevelProps } from './TileLevelDef';

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

export enum ChangeEventKind {
  SetScreen,
  SetSprite,
  RemoveSprite,
  SetCostume,
  SetTile,
  SetCodeFile,
}

/**
 * utility method for managing project
 */
export class Project {
  public readonly screen: ScreenDef;
  public readonly _storage: ProjectLocalStorage;
  public readonly onChange: AsyncEventSource<(kind: ChangeEventKind) => void> = new AsyncEventSource<() => void>();

  public get storage(): IProjectStorage { return this._storage; }

  public constructor(storage: ProjectLocalStorage, def: ScreenDef) {
    this._storage = storage;
    this.screen = def;
  }

  public static createEmptyProject(): Project {
    let storage = new ProjectLocalStorage();

    let levelProps = {
      gridWidth: 48,
      gridHeight: 8,
      tileWidth: 32,
      tileHeight: 32
    };

    let gridHeight = 8;
    let screen = new ScreenDef(
      storage,
      {
        screenWidth: levelProps.tileWidth * 20,
        screenHeight: levelProps.tileHeight * 8
      });

    screen.createLevel(levelProps);

    // create a default sprite
    screen.createSprite('Leia');
    screen.createSprite('Floor');
    screen.createSprite('Air');

    screen.level.setTiles([
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 0, y: 0 },
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 1, y: 0 },
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 2, y: 0 }]);

    screen.codeFile.createBlock('updateScene', '// put code to update scene here');

    return new Project(storage, screen);
  }

  public forEachSprite(func: (file: SpriteDef) => void) {
    this.screen.sprites.forEach((x: SpriteDef) => func(x));
  }

  public forEachCodeFile(func: (file: CodeFileDef) => void) {
    func(this.screen.codeFile);
    if (this.screen.level !== undefined) {
      func(this.screen.level?.codeFile);
    }
    this.screen.sprites.forEach((x: SpriteDef) => func(x.codeFile));
  }

  public findCodeFileById(id: string): CodeFileDef | undefined {
    if (this.screen.codeFile.id === id) {
      return this.screen.codeFile;
    }

    if (this.screen.level !== undefined && this.screen.level.codeFile.id === id) {
      return this.screen.level.codeFile;
    }

    return this.screen.sprites.find((x: SpriteDef) => x.codeFile.id === id)?.codeFile;
  }

  public findSpriteById(id: string): SpriteDef | undefined {
    return this.screen.sprites.getById(id);
  }

  public registerOnChange() {

  }
}

//let project = Project.createEmptyProject();
//export { project };