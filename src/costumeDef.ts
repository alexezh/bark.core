import { v4 as uuidv4 } from 'uuid';
import { x64Hash64 } from './hash/murmurhash3';
import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';
import { ObjectDef, IObjectDef } from './objectDef';
import { SpriteDef } from './spriteDef';
import { ISpriteSource } from './spriteSource';

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
  private _version: number = 1.0;
  private _cachedSpriteSource: CostumeImage | undefined = undefined;

  public get version() { return this._version; }

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
    this._version++;

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
    this._version++;
  }

  public processAdd(childId: string, op: any): void {
    throw 'not implemented';
  }

  public getSpriteSource() {
    if (this._cachedSpriteSource === undefined) {
      this._cachedSpriteSource = new CostumeImage(this);
    }
    return this._cachedSpriteSource;
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

export class CostumeImage implements ISpriteSource {
  private _image: any;
  private _costumeVersion: number;
  private _costume: CostumeDef;

  public constructor(costume: CostumeDef) {
    this._costume = costume;
    this._costumeVersion = this._costume.version;
    this.loadImage();
  }

  public draw(ctx: any, x: number, y: number, w: number, h: number): void {
    if (this._costumeVersion !== this._costume.version) {
      this.loadImage();
    }

    ctx.drawImage(this._image, x, y, w, h);
  }

  private loadImage() {
    this._image = new Image();
    this._image.src = this._costume.imageData?.image;
    this._costumeVersion = this._costume.version;
  }
}
