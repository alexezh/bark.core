
/**
 * stores list of callbacks
 */
export default class AsyncEventSource<T> {
  private _callbacks: (WeakRef<any> | null)[] = [];

  public add(func: T) {
    this._callbacks.push(new WeakRef<any>(func));
  }

  /**
   * removes registered callback, clears other references
   */
  public remove(func: T) {
    let j = 0;
    for (let i = 0; i < this._callbacks.length; i++) {
      let weakStored = this._callbacks[i];
      if (weakStored !== null) {
        let stored = weakStored.deref();
        if (stored !== undefined) {
          if (stored == func) {
            this._callbacks[i] = null;
            // do not increment j
          } else {
            j++;
          }
        } else {
          // do not increment j
        }
      } else {
        // do not increment j
        continue;
      }

      if (i != j) {
        this._callbacks[j] = this._callbacks[i];
      }
    }

    // resize array if needed
    if (j != this._callbacks.length) {
      this._callbacks.length = j;
    }
  }

  private invokeWorker(...args: any[]) {
    for (let i = 0; i < this._callbacks.length; i++) {
      let weakOnChange = this._callbacks[i] as WeakRef<any>;
      let func = weakOnChange.deref() as any;
      if (func) {
        func(...args);
      } else {
        console.log('missing func');
      }
    }
  }

  public invoke(...args: any[]) {
    // run outside current callstack
    setTimeout(() => {
      this.invokeWorker(...args);
    }, 0);
  }

  public invokeWithCompletion(onInvoke: () => void, ...args: any[]) {
    // run outside current callstack
    setTimeout(() => {
      this.invokeWorker(...args);
      onInvoke();
    }, 0);
  }
}
