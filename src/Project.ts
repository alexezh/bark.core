import { v4 as uuidv4 } from 'uuid';
import { x64Hash64 } from './hash/murmurhash3';
import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';

export interface IObjectDef {
  get id(): string;
  // get path(): string;
}

export class ObjectDef implements IObjectDef {
  public id: string;
  public parent: IObjectDef | undefined;
  protected _storage: IProjectStorage;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef | undefined,
    id: string | undefined = undefined,
    tag: string | undefined = undefined) {

    this.id = (id) ? id : uuidv4();
    // console.log('ObjectRef: ' + this.id + ' ' + tag);
    this.parent = parent;
    this._storage = storage;
  }
}

export class CodeBlockDef extends ObjectDef implements IStorageOpReceiver {
  public name: string;
  public code: string;
  public codeId: string;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    id: string | undefined,
    name: string,
    code: string,
    codeId: string | undefined = undefined) {

    super(storage, parent, id, 'CodeBlock');
    this.name = name;
    this.code = code;
    this.codeId = (codeId) ? codeId : x64Hash64(code);
    storage.registerReceiver(this.id, this);

    if (id === undefined) {
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
    }
  }

  public updateCode(code: string) {
    this.code = code;
    this.codeId = x64Hash64(code);

    this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
  }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): CodeBlockDef {
    return new CodeBlockDef(storage, parent, op.name, op.code, op.codeId);
  }

  public processSet(op: any): void {
    this.name = op.name;
    this.code = op.code;
    this.codeId = op.codeId;
  }

  public processAdd(childId: string, op: any): void {
    throw 'not implemented';
  }

  private createUpdateOp() {
    return {
      target: 'CodeBlock',
      name: this.name,
      code: this.code,
      codeId: this.codeId
    }
  }
}

export class CodeFileDef extends ObjectDef implements IStorageOpReceiver {
  // name of code file; for sprites the same as sprite name
  public name: string;
  public codeBlocks: CodeBlockDef[] = [];

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef | undefined,
    id: string | undefined,
    name: string | undefined = undefined) {

    super(storage, parent, id, 'CodeFile');
    this.name = (name) ? name : 'No name';

    storage.registerReceiver(this.id, this);
    if (id === undefined) {
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
    }
  }

  public createBlock(name: string, code: string) {
    this.codeBlocks.push(new CodeBlockDef(this._storage, this, undefined, name, code));
  }

  public get firstBlock(): CodeBlockDef | undefined { return (this.codeBlocks.length > 0) ? this.codeBlocks[0] : undefined }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): CodeFileDef {
    return new CodeFileDef(storage, parent, id, op.name);
  }

  public processSet(op: any): void {
    this.name = op.name;
  }

  public processAdd(childId: string, op: any): void {
    this.codeBlocks.push(CodeBlockDef.fromOp(this._storage, this, childId, op));
  }

  private createUpdateOp(): any {
    return {
      target: 'CodeFile',
      name: this.name,
      codeBlockCount: this.codeBlocks.length
    }
  }
}

export enum ImageFormat {
  svg,
  png
}

export class ImageData {
  public readonly image: string | undefined = undefined;
  public readonly imageFormat: ImageFormat = ImageFormat.svg;
  public readonly imageId: string | undefined = undefined;

  public constructor(imageFormat: ImageFormat, image: string, imageId: string | undefined = undefined) {
    this.imageFormat = imageFormat;
    this.image = image;
    this.imageId = (imageId) ? imageId : x64Hash64(image);
  }

  public static isEqual(a: ImageData | undefined, b: ImageData | undefined): boolean {
    if (a === undefined && b === undefined) {
      return true;
    } else if (a === undefined || b === undefined) {
      return false;
    } else {
      // @ts-ignore
      return a.imageId === b.imageId;
    }
  }
}

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class CostumeDef extends ObjectDef implements IStorageOpReceiver {
  public name: string = 'No name';
  public imageData: ImageData | undefined;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    id: string | undefined) {

    super(storage, parent, id, 'Costume');
    storage.registerReceiver(this.id, this);
    if (id === undefined) {
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
    }
  }

  public updateImage(imageData: ImageData) {
    this.imageData = imageData;

    let sprite = this.parent as SpriteDef;
    if (sprite !== undefined) {
      sprite.onCostumeChange.invoke(this);
    }

    this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
  }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any) {
    let costume = new CostumeDef(storage, parent, id);
    costume.processSet(op);
    return costume;
  }

  public processSet(op: any): void {
    this.name = op.name;
    this.imageData = new ImageData(op.imageFormat, op.image, op.imageId);
  }

  public processAdd(childId: string, op: any): void {
    throw 'not implemented';
  }

  private createUpdateOp() {
    return {
      target: 'Costume',
      name: this.name,
      image: this.imageData?.image,
      imageFormat: this.imageData?.imageFormat,
      imageId: this.imageData?.imageId
    }
  }
}

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class SpriteDef extends ObjectDef implements IStorageOpReceiver {
  // user defined name of the sprite
  public name: string = 'No name';
  public width: number = 0;
  public height: number = 0;
  // @ts-ignore
  public codeFile: CodeFileDef;
  public costumes: CostumeDef[] = [];

  /**
   * called when costume changes
   */
  public onCostumeChange = new AsyncEventSource<(costume: CostumeDef) => void>();

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef | undefined,
    id: string | undefined,
    name: string) {

    super(storage, parent, id, 'Sprite');
    this.name = name;

    storage.registerReceiver(this.id, this);

    // add one costume by default
    if (id === undefined) {
      this.codeFile = new CodeFileDef(storage, this, undefined, name);
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
      this.costumes.push(new CostumeDef(storage, this, undefined));
    }
  }

  public get firstCostume(): CostumeDef { return this.costumes[0] }

  public findCostume(id: string): CostumeDef | undefined {
    for (let i = 0; i < this.costumes.length; i++) {
      if (this.costumes[i].id == id) {
        return this.costumes[i];
      }
    }

    return undefined;
  }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): SpriteDef {
    let sprite = new SpriteDef(storage, parent, id, op.name);
    sprite.processSet(op);
    return sprite;
  }

  public processSet(op: any): void {
    this.name = op.name;
    this.width = op.width;
    this.height = op.height;
  }

  public processAdd(childId: string, op: any): void {
    this.costumes.push(CostumeDef.fromOp(this._storage, this, childId, op));
  }

  private createUpdateOp() {
    return {
      target: 'Sprite',
      name: this.name,
      width: this.width,
      height: this.height,
      costumeCount: this.costumes.length
    }
  }

  public static isEqual(a: SpriteDef | undefined, b: SpriteDef | undefined): boolean {
    if (a === undefined && b === undefined) {
      return true;
    } else if (a === undefined || b === undefined) {
      return false;
    } else {
      return a === b;
    }
  }
}

export type TileLevelProps = {
  /**
   * width in tiles
   */
  gridWidth: number;

  /**
   * height in tiles
   */
  gridHeight: number;

  /**
   * width of tile in pixels
   */
  tileWidth: number;

  /**
   * height of tile in pixels
   */
  tileHeight: number;
}

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class TileLevelDef extends ObjectDef implements IStorageOpReceiver {
  // @ts-ignore
  public codeFile: CodeFileDef;
  /** rows contains array of SpriteDef */
  public rows: any[] = [];
  public props: TileLevelProps;
  private _tilesId: string;
  private _sprites: SpriteDefCollection;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    id: string | undefined,
    props: TileLevelProps | undefined,
    sprites: SpriteDefCollection) {

    super(storage, parent, id, 'TileLevel')
    this._tilesId = this.id + '.tiles';

    // @ts-ignore
    this.props = props
    this._sprites = sprites;

    this._storage.registerReceiver(this.id, this);
    if (id === undefined) {
      this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
      this.codeFile = new CodeFileDef(storage, this, undefined);
      this.updateTiles();
    }
  }

  public static fromOp(
    storage: IProjectStorage,
    parent: IObjectDef, id: string,
    sprites: SpriteDefCollection,
    op: any): TileLevelDef {

    let level = new TileLevelDef(storage, parent, id, op.props, sprites);
    level.processSet(op);
    return level;
  }

  public processSet(op: any): void {
    this.props = op.props;
    this.rows = op.rows;
  }

  public processAdd(childId: string, op: any): void {
    if (childId === this._tilesId) {
      let tileOps = op as any[];
      tileOps.forEach(spriteDef => {
        let row = this.rows[spriteDef.y];
        row[spriteDef.x] = this._sprites.getById(spriteDef.id)
      });
    } else {
      this.codeFile = CodeFileDef.fromOp(this._storage, this, childId, op);
    }
  }

  private createUpdateOp() {
    return {
      target: 'TileLevel',
      props: this.props,
      rows: this.rows
    }
  }

  public setSize(gridWidth: number, gridHeight: number) {
    this.props.gridWidth = gridWidth;
    this.props.gridHeight = gridHeight;
    this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
  }

  public setTiles(tiles: { sprite: SpriteDef, x: number, y: number }[]) {
    let updateTiles: any[] = [];
    tiles.forEach(tile => {
      let row: any[] = this.rows[tile.y];
      let spriteDef = this.createSpriteRef(tile.sprite.id, tile.x * this.props.tileWidth, tile.y * this.props.tileHeight);
      row[tile.x] = spriteDef;
      updateTiles.push(spriteDef);
    });

    // use ourself as parent for op
    this._storage.appendItems(this._tilesId, this.id, updateTiles);

    tiles.forEach(tile => {
      let row: any[] = this.rows[tile.y];
      let spriteDef = this.createSpriteRef(tile.sprite.id, tile.x * this.props.tileWidth, tile.y * this.props.tileHeight);
      row[tile.x] = spriteDef;
      updateTiles.push(spriteDef);
    });
  }

  private updateTiles() {
    if (this.props.gridHeight > this.rows.length) {
      for (let i = this.rows.length; i < this.props.gridHeight; i++) {
        this.rows.push([]);
      }
    } else {
      this.rows.length = this.props.gridHeight;
    }

    // update size of rows if needed
    for (let i = 0; i < this.rows.length; i++) {
      let row: any[] = this.rows[i];
      if (row.length < this.props.gridWidth) {
        for (let j = row.length; j < this.props.gridWidth; j++) {
          row.push(null);
        }
      } else {
        row.length = this.props.gridWidth;
      }
    }
  }

  private createSpriteRef(id: string, x: number, y: number) {
    return {
      id: id,
      x: x,
      y: y
    }
  }
}

export class SpriteDefCollection {
  /**
   * collection of all sprites in a game
   */
  private _sprites: SpriteDef[] = [];
  public asArray(): SpriteDef[] { return this._sprites; }
  public get length(): number { return this._sprites.length; }

  public push(sprite: SpriteDef) {
    this._sprites.push(sprite);
  }

  public getByName(name: string): SpriteDef | undefined {
    for (let i = 0; i < this._sprites.length; i++) {
      if (this._sprites[i].name == name) {
        return this._sprites[i];
      }
    }

    return undefined;
  }

  public getByNameOrThrow(name: string): SpriteDef {
    let sprite = this.getByName(name);
    if (sprite === undefined) {
      throw 'sprite not found:' + name;
    }
    return sprite;
  }

  public getById(id: string) {
    for (let spriteKey in this._sprites) {
      let sprite = this._sprites[spriteKey];
      if (sprite.id === id) {
        return sprite;
      }
    }
    return undefined;
  }

  public forEach(func: any) {
    this._sprites.forEach((x) => func(x));
  }

  public find(pred: (x: SpriteDef) => boolean): SpriteDef | undefined {
    for (let spriteKey in this._sprites) {
      let sprite = this._sprites[spriteKey];
      if (pred(sprite)) {
        return sprite;
      }
    }
    return undefined;
  }
}

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

/**
 * utility method for managing project
 */
export class Project {
  public readonly def: ScreenDef;
  public readonly _storage: ProjectLocalStorage;
  public readonly onChange: AsyncEventSource<() => void> = new AsyncEventSource<() => void>();

  public get storage(): IProjectStorage { return this._storage; }

  public constructor(storage: ProjectLocalStorage, def: ScreenDef) {
    this._storage = storage;
    this.def = def;
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
    this.def.sprites.forEach((x: SpriteDef) => func(x));
  }

  public forEachCodeFile(func: (file: CodeFileDef) => void) {
    func(this.def.codeFile);
    if (this.def.level !== undefined) {
      func(this.def.level?.codeFile);
    }
    this.def.sprites.forEach((x: SpriteDef) => func(x.codeFile));
  }

  public findCodeFileById(id: string): CodeFileDef | undefined {
    if (this.def.codeFile.id === id) {
      return this.def.codeFile;
    }

    if (this.def.level !== undefined && this.def.level.codeFile.id === id) {
      return this.def.level.codeFile;
    }

    return this.def.sprites.find((x: SpriteDef) => x.codeFile.id === id)?.codeFile;
  }

  public findSpriteById(id: string): SpriteDef | undefined {
    return this.def.sprites.getById(id);
  }
}

//let project = Project.createEmptyProject();
//export { project };