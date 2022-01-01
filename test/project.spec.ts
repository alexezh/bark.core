import { describe } from 'mocha';
import assert from 'assert';

import * as project from '../src/index';

describe('project tests', function () {
  it('load ', function () {
    let prj1 = project.Project.createEmptyProject();

    let storage2 = new project.ProjectLocalStorage();
    let screen2 = new project.ScreenDef(storage2);

    // send ops to the second storage
    prj1.storage.registerOnChange((ops: project.StorageOp[]) => {
      ops.forEach(op => storage2.processRemoteOp(op));
    });

    assert(screen2.level.rows.length === prj1.def.level.rows.length);
    assert(screen2.sprites.length === prj1.def.sprites.length);
  });
})