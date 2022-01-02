export enum StorageOpKind {
  remove = 'remove',
  /** update item */
  set = 'set',
  append = 'append',
  screenReady = 'screenReady',
  selectSprite = 'selectSprite'
}

export class StorageOp {
  public readonly kind: StorageOpKind;
  public readonly id: string;
  public readonly parent: string | undefined;
  public readonly value: any;

  public constructor(kind: StorageOpKind, id: string, parent: string | undefined = undefined, value: any = null) {
    this.kind = kind;
    this.id = id;
    this.parent = parent;
    this.value = value;
  }
}

export interface IStorageOpReceiver {
  processSet(op: any): void;
  processAdd(childId: string, op: any): void;
}

export interface IProjectStorage {
  updateSnapshot(json: string): void;
  setItem(id: string, parent: string | undefined, value: any): void;
  removeItem(id: string): void;

  /**
   * treats items as array of values
   */
  appendItems(id: string, parent: string | undefined, value: any[]): void;

  processRemoteOp(op: StorageOp): void;

  registerOnChange(func: (op: StorageOp[]) => void): void;
  unregisterOnChange(func: (op: StorageOp[]) => void): void;

  /**
   * register receiver for processing of remote ops
   */
  registerReceiver(id: string, receiver: IStorageOpReceiver): void;

  toJson(): string;
}

