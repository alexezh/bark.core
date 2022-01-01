import { v4 as uuidv4 } from 'uuid';
import { x64Hash64 } from './hash/murmurhash3';
import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';
import { ObjectDef, IObjectDef } from './objectDef';
import { SpriteDef } from './spriteDef';

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

