import { IProjectStorage, IStorageOpReceiver, StorageOp, StorageOpKind } from './IProjectStorage';
import AsyncEventSource from './AsyncEventSource';

export class ProjectLocalStorage implements IProjectStorage {
  private _data: { [key: string]: { parent: string | undefined, value: any } } = {};
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
    this._data[id] = { parent: parent, value: value };
    this.queueChange(new StorageOp(StorageOpKind.set, id, parent, value));
  }

  public removeItem(id: string) {
    delete this._data[id];
    this.queueChange(new StorageOp(StorageOpKind.remove, id));
  }

  public appendItems(id: string, parent: string | undefined, value: any[]) {
    let item = this._data[id];
    if (item === undefined) {
      item = { parent: parent, value: [] };
      this._data[id] = item;
    }

    value.forEach(x => item.value.push(x));

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

      parent.processAdd(op.id, op.value);
    } else {
      let receiver = weakReceiver.deref();
      if (!receiver) {
        console.log('ProjectLocalStorage: object released: ' + op.id);
        return;
      }

      receiver.processSet(op.value);
    }
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
    let ops = this.makePopulateList();

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

  private makePopulateOp(
    id: string,
    ops: any[],
    writtenOps: Set<string>) {

    if (writtenOps.has(id)) {
      return;
    }

    let data = this._data[id];
    if (data.parent !== undefined) {
      if (!writtenOps.has(data.parent)) {
        this.makePopulateOp(data.parent, ops, writtenOps);
      }
    }

    if (Array.isArray(data)) {
      console.log('append : ' + data.value.length);
      ops.push(new StorageOp(StorageOpKind.append, id, data.parent, data.value));
    } else {
      ops.push(new StorageOp(StorageOpKind.set, id, data.parent, data.value));
    }
    writtenOps.add(id);
  }

  /** generates list of ops in dependency order
   * ops without dependencies go first
   */
  private makePopulateList(): any[] {
    let ops: any[] = [];
    let writtenOps: Set<string> = new Set<string>();
    for (let id in this._data) {
      this.makePopulateOp(id, ops, writtenOps);
    }
    return ops;
  }

  public toJson(): string {
    let ops = this.makePopulateList();

    return JSON.stringify(ops);
  }
}
