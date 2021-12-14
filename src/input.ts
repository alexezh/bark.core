namespace bark {
  export class Input {
    public pressedKeys: any = {};

    public constructor() {
      let self = this;
      window.addEventListener('keydown', (evt) => self.onKeyDown(evt), false);
      window.addEventListener('keyup', (evt) => self.onKeyUp(evt), false);
    }


    private onKeyDown(evt: any) {
      this.pressedKeys[evt.code] = true;
    }

    private onKeyUp(evt: any) {
      this.pressedKeys[evt.code] = false;
    }
  }
}