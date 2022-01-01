import AsyncEventSource from './AsyncEventSource';

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
  appendItem(id: string, value: any): void;

  processRemoteOp(op: StorageOp): void;

  registerOnChange(func: (op: StorageOp[]) => void): void;
  unregisterOnChange(func: (op: StorageOp[]) => void): void;

  /**
   * register receiver for processing of remote ops
   */
  registerReceiver(id: string, receiver: IStorageOpReceiver): void;

  toJson(): string;
}

export class ProjectLocalStorage implements IProjectStorage {
  private _data: { [key: string]: any } = {};
  private _receivers: { [key: string]: WeakRef<IStorageOpReceiver> } = {}
  private _onChange: AsyncEventSource<(costume: StorageOp[]) => void> = new AsyncEventSource<(costume: StorageOp[]) => void>();
  private _changeQueue: StorageOp[] = [];
  private _updatePending: boolean = false;

  public constructor() {
    this.onInvokeComplete = this.onInvokeComplete.bind(this);
  }

  public updateSnapshot(json: string) {
    throw new Error("Method not implemented.");
  }
  public setItem(id: string, parent: string | undefined, value: any) {
    this._data[id] = value;
    this.queueChange(new StorageOp(StorageOpKind.set, id, parent, value));
  }

  public removeItem(id: string) {
    delete this._data[id];
    this.queueChange(new StorageOp(StorageOpKind.remove, id));
  }

  public appendItem(id: string, value: any) {
    let item = this._data[id];
    if (item === undefined) {
      item = [];
      this._data[id] = item;
    }

    item.push(value);
    this.queueChange(new StorageOp(StorageOpKind.append, id, undefined, value));
  }

  public processRemoteOp(op: StorageOp) {
    switch (op.kind) {
      case StorageOpKind.set:
        this.processSetOp(op);
        break;
      case StorageOpKind.append:
        break;
      case StorageOpKind.remove:
        delete this._data[op.id];
        break;
    }
  }

  /**
   * creates new or updates existing item
   */
  private processSetOp(op: StorageOp) {
    let weakReceiver = this._receivers[op.id];

    // if we do not have object, try to create one in parent
    if (!weakReceiver) {
      if (op.parent === undefined) {
        throw 'ProjectLocalStorage: op.parent undefined';
      }
      let weakParent = this._receivers[op.parent];
      if (!weakParent) {
        console.log('ProjectLocalStorage: parent not registered: ' + op.parent);
        return;
      }

      let parent = weakParent.deref();
      if (!parent) {
        console.log('ProjectLocalStorage: parent released: ' + op.parent);
        return;
      }

      parent.
    }

    let receiver = weakReceiver.deref();
    if (!receiver) {
      console.log('ProjectLocalStorage: object released: ' + op.id);
      return;
    }

    receiver.processOp(op.value);
  }

  private queueChange(op: StorageOp) {
    this._changeQueue.push(op);
    if (!this._updatePending) {
      this._updatePending = true;
      this._onChange.invokeWithCompletion(this.onInvokeComplete, this._changeQueue);
      this._changeQueue = [];
    }
  }

  private onInvokeComplete() {
    this._updatePending = false;
    if (this._changeQueue.length === 0) {
      return;
    }

    this._updatePending = true;
    this._onChange.invokeWithCompletion(this.onInvokeComplete, this._changeQueue);
    this._changeQueue = [];
  }

  public registerOnChange(func: (op: StorageOp[]) => void) {
    // send current state to sink
    let ops: any[] = [];
    for (let id in this._data) {
      ops.push(new StorageOp(StorageOpKind.set, id, this._data[id]));
    }
    func(ops);

    // register to receive notifications
    this._onChange.add(func);
  }

  public unregisterOnChange(func: (op: StorageOp[]) => void) {
    this._onChange.remove(func);
  }

  public registerReceiver(id: string, receiver: IStorageOpReceiver): void {
    this._receivers[id] = new WeakRef<IStorageOpReceiver>(receiver);
  }

  public toJson(): string {
    let ops: any[] = [];
    for (let id in this._data) {
      ops.push(new StorageOp(StorageOpKind.set, id, this._data[id]));
    }
    return JSON.stringify(ops);
  }
}
