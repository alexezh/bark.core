import { v4 as uuidv4 } from 'uuid';
import { IProjectStorage } from './IProjectStorage';

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
