import AsyncEventSource from './AsyncEventSource';

export enum StorageOpKind {
  set = 'set',
  remove = 'remove',
  append = 'append',
  screenReady = 'screenReady',
  selectSprite = 'selectSprite'
}

export class StorageOp {
  public readonly kind: StorageOpKind;
  public readonly id: string;
  public readonly value: any;

  public constructor(kind: StorageOpKind, id: string, value: any = null) {
    this.kind = kind;
    this.id = id;
    this.value = value;
  }
}

export interface IProjectStorage {
  updateSnapshot(json: string): void;
  setItem(id: string, value: any): void;
  removeItem(id: string): void;
  /**
   * treats items as array of values
   */
  appendItem(id: string, value: any): void;

  registerOnChange(func: (op: StorageOp[]) => void): void;
  unregisterOnChange(func: (op: StorageOp[]) => void): void;
  toJson(): string;
}

export class ProjectLocalStorage implements IProjectStorage {
  private _data: { [key: string]: any } = {};
  private _onChange: AsyncEventSource<(costume: StorageOp[]) => void> = new AsyncEventSource<(costume: StorageOp[]) => void>();
  private _changeQueue: StorageOp[] = [];
  private _updatePending: boolean = false;

  public constructor() {
    this.onInvokeComplete = this.onInvokeComplete.bind(this);
  }

  public updateSnapshot(json: string) {
    throw new Error("Method not implemented.");
  }
  public setItem(id: string, value: any) {
    this._data[id] = value;
    this.queueChange(new StorageOp(StorageOpKind.set, id, value));
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
    this.queueChange(new StorageOp(StorageOpKind.append, id, value));
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

  public toJson(): string {
    let ops: any[] = [];
    for (let id in this._data) {
      ops.push(new StorageOp(StorageOpKind.set, id, this._data[id]));
    }
    return JSON.stringify(ops);
  }
}
