// number properties which can be animated
export class NumberProperty {
  private _value: number;
  public id: number;

  public constructor(value: number | undefined) {
    this._value = (value !== undefined) ? value : 0;
    this.id = animator.nextId();
  }

  public glide(delta: number, step: number) {
    animator.animateLinear(this, delta, step);
  }

  public add(delta: number) {
    this._value = this._value + delta;
  }

  public get() {
    return this._value;
  }

  public set(value: number) {
    this._value = value;
  }
}

// applies linear animation to a property
// changes property by step until the total change is delta
export class LinearAnimator {
  public prop: NumberProperty;
  public delta: number;
  public step: number;

  constructor(prop: NumberProperty, delta: number, step: number) {
    this.prop = prop;
    this.delta = delta;
    this.step = step;
  }

  public animate(frameTime: number) {
    if (this.delta === 0) {
      return false;
    } else if (this.delta > 0) {
      if (this.delta > this.step) {
        this.delta -= this.step;
        this.prop.add(this.step);
        return true;
      } else {
        this.prop.add(this.delta);
        this.delta = 0;
        return false;
      }
    } else {
      if (this.delta < this.step) {
        this.delta -= this.step;
        this.prop.add(this.step);
        return true;
      } else {
        this.prop.add(this.delta);
        this.delta = 0;
        return false;
      }
    }
  }
}

// applies linear animation to a property
// changes property by step until the total change is delta
export class LinearAnimator2 {
  public obj: any;
  public prop: string;
  public delta: number;
  public step: number;

  constructor(obj: object, prop: string, delta: number, step: number) {
    this.obj = obj;
    this.prop = prop;
    this.delta = delta;
    this.step = step;
  }

  public animate(frameTime: number) {
    if (this.delta === 0) {
      return false;
    } else if (this.delta > 0) {
      if (this.delta > this.step) {
        this.delta -= this.step;
        this.obj[this.prop] += this.step;
        return true;
      } else {
        this.obj[this.prop] += this.delta;
        this.delta = 0;
        return false;
      }
    } else {
      if (this.delta < this.step) {
        this.delta -= this.step;
        this.obj[this.prop] += this.step;
        return true;
      } else {
        this.obj[this.prop] += this.delta;
        this.delta = 0;
        return false;
      }
    }
  }
}

// applies linear animation to a property
// changes property by step until the total change is delta
export class LoopLinearAnimator {
  public prop: NumberProperty;
  public startDelta: number;
  public delta: number;
  public step: number;
  public direction: number;

  constructor(prop: NumberProperty, delta: number, step: number) {
    this.prop = prop;
    this.startDelta = Math.abs(delta);
    this.delta = this.startDelta;
    this.step = Math.abs(step);
    this.direction = (delta > 0) ? 1 : -1;
  }

  public animate(frameTime: number) {
    if (this.delta > this.step) {
      this.delta -= this.step;
      this.prop.add(this.step * this.direction);
    } else {
      this.prop.set(this.delta * this.direction);
      this.delta = this.startDelta;
      this.direction = -this.direction;
    }

    return true;
  }
}

// goes through list of values in array
export class DiscreteAnimator {
  public prop: NumberProperty;
  public values: number[];
  public index: number;
  public intervalMs: number;
  public lastFrameTimeMs: number;

  constructor(prop: NumberProperty, values: number[], intervalSeconds: number) {
    this.prop = prop;
    this.values = values;
    this.index = 0;
    this.intervalMs = intervalSeconds * 1000;
    this.lastFrameTimeMs = performance.now();
    this.prop.set(this.values[this.index]);
  }

  public animate(frameTime: number) {
    if (this.lastFrameTimeMs + this.intervalMs > frameTime)
      return true;

    let newIndex = this.index + 1;
    if (newIndex >= this.values.length)
      newIndex = 0;

    this.index = newIndex;
    this.prop.set(this.values[newIndex]);
    this.lastFrameTimeMs = frameTime;

    return true;
  }
}

// keeps track of animated properties
export class PropertyAnimationManager {
  private _props: { [key: number]: any };
  private _props2: { [key: string]: any };
  private _nextKey: number;
  private onUpdateScene: any;

  constructor() {
    this._props = {};
    this._props2 = {};
    this._nextKey = 0;
    this.onUpdateScene = null;

    // run animation on 100 ms
    let self = this;
    setInterval(() => self.processAnimation(), 100);
  }

  public animateLinear(prop: NumberProperty, delta: number, step: number) {
    if (this._props[prop.id] !== undefined) {
      return;
    }

    this._props[prop.id] = new LinearAnimator(prop, delta, step);
  }

  public animate(prop: NumberProperty, animator: any) {
    if (prop === undefined || animator == undefined)
      throw "missing required args";

    if (this._props[prop.id] !== undefined) {
      return;
    }

    this._props[prop.id] = animator;
  }

  // animates property of an object. Object should have "id" property which used as a key
  public glide(args: { obj: any, prop: string, delta: number, step: number }) {
    this._props2[args.obj.id + args.prop] = new LinearAnimator2(args.obj, args.prop, args.delta, args.step);
  }

  public animateProperty(args: { obj: any, prop: string, animator: any }) {
    this._props2[args.obj.id + args.prop] = args.animator;
  }

  public nextId(): number {
    return this._nextKey++;
  }

  public processAnimation() {
    let frameTime = performance.now();
    for (let key in this._props) {
      let prop = this._props[key];
      if (!prop.animate(frameTime)) {
        delete this._props[key];
      }
    }

    for (let key in this._props2) {
      let prop = this._props2[key];
      if (!prop.animate(frameTime)) {
        delete this._props2[key];
      }
    }

    if (this.onUpdateScene !== null) {
      return this.onUpdateScene();
    }
  }
}

export var animator = new PropertyAnimationManager();
