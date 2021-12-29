/// <reference path="input.ts" />
/// <reference path="screen.ts" />
/// <reference path="game.ts" />

namespace bark {
  // globals used by rest of code
  export var game = new Game();
  export var screen = new Screen();
  export var input = new Input();
  export var project: { [id: string]: any } = {};

  function loadCodeBlock(name: string, code: string) {

  }

  function processOp(op: any) {
    if (op.kind === 'update') {
      project[op.id] = op.data;
      console.log('process ' + op.target);
      if (op.target === 'CodeBlock') {
        loadCodeBlock(op.name, op.code);
      }
    } else if (op.op == 'remove') {
      delete project[op.id];
    }
  }

  function processEvent(opsJson: string) {
    try {
      let ops = JSON.parse(opsJson);
      ops.forEach((x: any) => processOp(x));
    }
    catch (error) {
      console.log('cannot parse ops')
      throw (error);
    }
  }

  /**
   * called when game is loaded
   */
  export function onLoadFrame(canvas: any) {
    window.addEventListener("message", (event) => {
      processEvent(event.data);
    }, false);

    game.loadCanvas(canvas);
  }
}