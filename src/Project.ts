import { v4 as uuidv4 } from 'uuid';
import { x64Hash64 } from './hash/murmurhash3';
import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';

export interface IObjectDef {
  get path(): string;
}

export class ObjectDef implements IObjectDef {
  public id: string;
  public parent: IObjectDef | undefined;
  protected _storage: IProjectStorage;

  public constructor(storage: IProjectStorage, parent: IObjectDef | undefined) {
    this.id = uuidv4();
    this.parent = parent;
    this._storage = storage;
  }

  public get path(): string {
    if (this.parent !== undefined) {
      return this.parent.path + '!' + this.id;
    } else {
      return this.id;
    }
  }
}

export class CodeBlockDef extends ObjectDef implements IStorageOpReceiver {
  public name: string;
  public code: string;
  public codeId: string;

  public constructor(storage: IProjectStorage, parent: IObjectDef, name: string, code: string) {
    super(storage, parent);
    this.name = name;
    this.code = code;
    this.codeId = x64Hash64(code);
    storage.registerReceiver(this.path, this);
    storage.setItem(this.path, this.createUpdateOp());
  }

  public updateCode(code: string) {
    this.code = code;
    this.codeId = x64Hash64(code);

    this._storage.setItem(this.path, this.createUpdateOp());
  }

  public processOp(op: any): void {
    this.name = op.name;
    this.code = op.code;
    this.codeId = op.codeId;
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

export class CodeFileDef extends ObjectDef {
  // name of code file; for sprites the same as sprite name
  public name: string = 'No name';
  public codeBlocks: CodeBlockDef[] = [];

  public constructor(storage: IProjectStorage, parent: IObjectDef | undefined, name: string) {
    super(storage, parent);
    this.name = name;
    storage.setItem(this.path, this.createUpdateOp());
  }

  public createBlock(name: string, code: string) {
    this.codeBlocks.push(new CodeBlockDef(this._storage, this, name, code));
  }

  public get firstBlock(): CodeBlockDef | undefined { return (this.codeBlocks.length > 0) ? this.codeBlocks[0] : undefined }

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

  public constructor(imageFormat: ImageFormat, image: string) {
    this.imageFormat = imageFormat;
    this.image = image;
    this.imageId = x64Hash64(image);
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
export class CostumeDef extends ObjectDef {
  public name: string = 'No name';
  public imageData: ImageData | undefined;

  public constructor(storage: IProjectStorage, parent: IObjectDef) {
    super(storage, parent);
    this.id = uuidv4();
    storage.setItem(this.path, this.createUpdateOp());
  }

  public updateImage(imageData: ImageData) {
    this.imageData = imageData;

    let sprite = this.parent as SpriteDef;
    if (sprite !== undefined) {
      sprite.onCostumeChange.invoke(this);
    }

    this._storage.setItem(this.path, this.createUpdateOp());
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
export class SpriteDef extends ObjectDef {
  // user defined name of the sprite
  public name: string = 'No name';
  public width: number = 0;
  public height: number = 0;
  public codeFile: CodeFileDef;
  public costumes: CostumeDef[] = [];

  /**
   * called when costume changes
   */
  public onCostumeChange = new AsyncEventSource<(costume: CostumeDef) => void>();

  public constructor(storage: IProjectStorage, parent: IObjectDef | undefined, name: string) {
    super(storage, parent);
    this.name = name;
    this.codeFile = new CodeFileDef(storage, this, name);

    storage.setItem(this.path, this.createUpdateOp());

    // add one costume by default
    this.costumes.push(new CostumeDef(storage, this));
    this.costumes.push(new CostumeDef(storage, this));
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

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class TileLevelDef extends ObjectDef {
  public cells: any[] = [];
  public codeFile: CodeFileDef;
  public rows: any[] = [];
  public props: {
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

  public constructor(storage: IProjectStorage, parent: IObjectDef, gridWidth: number, gridHeight: number) {
    super(storage, parent)
    this.codeFile = new CodeFileDef(storage, this, 'level');
    this.props = {
      gridWidth: gridWidth,
      gridHeight: gridHeight,
      tileWidth: 32,
      tileHeight: 32
    }

    this._storage.setItem('level', this.createUpdateOp());
    this.updateTiles();
  }

  public setSize(gridWidth: number, gridHeight: number) {
    this.props.gridWidth = gridWidth;
    this.props.gridHeight = gridHeight;
    this._storage.setItem(this.path, this.createUpdateOp());
  }

  public setTiles(tiles: { sprite: SpriteDef, x: number, y: number }[]) {
    let updateTiles: any[] = [];
    tiles.forEach(tile => {
      let row: any[] = this.rows[tile.y];
      let spriteDef = this.createSpriteRef(tile.sprite.id, tile.x * this.props.tileWidth, tile.y * this.props.tileHeight);
      row[tile.x] = spriteDef;
      updateTiles.push(spriteDef);
    });

    this._storage.appendItem('tiles', updateTiles);

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

  private createUpdateOp() {
    return {
      target: 'TileLevel',
      props: this.props,
      rows: this.rows
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

export class ScreenDef extends ObjectDef {
  /**
   * collection of all sprites in a game
   */
  public sprites: SpriteDef[] = [];
  // @ts-ignore
  public level: TileLevelDef;
  // @ts-ignore
  public codeFile: CodeFileDef;
  public props: {
    screenWidth: number,
    screenHeight: number,
  };

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    screenWidth: number,
    screenHeight: number) {

    super(storage, undefined);

    this._storage = storage;
    this.props = {
      screenWidth: screenWidth,
      screenHeight: screenHeight
    }
    storage.setItem('project', this.createUpdateOp());
  }

  public setSize(screenWidth: number, screenHeight: number) {
    this.props.screenWidth = screenWidth;
    this.props.screenHeight = screenHeight;

    this._storage.setItem('project', this.createUpdateOp());
  }

  public createSprite(name: string): SpriteDef {
    let sprite = new SpriteDef(this._storage, undefined, name);
    this.sprites.push(sprite);
    return sprite;
  }

  private createUpdateOp() {
    return {
      target: 'Project',
      props: this.props,
      spriteCount: this.sprites.length
    }
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

    let level = new TileLevelDef(storage, 48, 8);
    let def = new ScreenDef(
      storage,
      level,
      level.props.tileWidth * 20,
      level.props.tileHeight * 8);

    // @ts-ignore

    def.codeFile.createBlock('updateScene', '// put code to update scene here');

    return new Project(storage, def);
  }

  public forEachSprite(func: (file: SpriteDef) => void) {
    this.def.sprites.forEach((x) => func(x));
  }

  public forEachCodeFile(func: (file: CodeFileDef) => void) {
    func(this.def.codeFile);
    if (this.def.level !== undefined) {
      func(this.def.level?.codeFile);
    }
    this.def.sprites.forEach((x) => func(x.codeFile));
  }

  public findCodeFileById(id: string): CodeFileDef | undefined {
    if (this.def.codeFile.id === id) {
      return this.def.codeFile;
    }

    if (this.def.level !== undefined && this.def.level.codeFile.id === id) {
      return this.def.level.codeFile;
    }

    for (let spriteKey in this.def.sprites) {
      let sprite = this.def.sprites[spriteKey];
      if (sprite.codeFile.id === id) {
        return sprite.codeFile;
      }
    }

    return undefined;
  }

  public findSpriteById(id: string): SpriteDef | undefined {
    for (let spriteKey in this.def.sprites) {
      let sprite = this.def.sprites[spriteKey];
      if (sprite.id === id) {
        return sprite;
      }
    }

    return undefined;
  }
}

let project = Project.createEmptyProject();
export { project };