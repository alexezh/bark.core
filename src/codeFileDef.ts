import { x64Hash64 } from "./hash/murmurhash3";
import { IObjectDef, ObjectDef } from "./ObjectDef";
import { IProjectStorage, IStorageOpReceiver } from "./IProjectStorage";

export class CodeBlockDef extends ObjectDef implements IStorageOpReceiver {
  public name: string;
  public code: string;
  public codeId: string;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    id: string | undefined,
    name: string,
    code: string,
    codeId: string | undefined = undefined) {

    super(storage, parent, id, 'CodeBlock');
    this.name = name;
    this.code = code;
    this.codeId = (codeId) ? codeId : x64Hash64(code);
    storage.registerReceiver(this.id, this);

    if (id === undefined) {
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
    }
  }

  public updateCode(code: string) {
    this.code = code;
    this.codeId = x64Hash64(code);

    this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
  }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): CodeBlockDef {
    return new CodeBlockDef(storage, parent, op.name, op.code, op.codeId);
  }

  public processSet(op: any): void {
    this.name = op.name;
    this.code = op.code;
    this.codeId = op.codeId;
  }

  public processAdd(childId: string, op: any): void {
    throw 'not implemented';
  }

  private createUpdateOp() {
    return {
      target: 'CodeBlock',
      name: this.name,
      code: this.code,
      codeId: this.codeId
    }
  }
}

export class CodeFileDef extends ObjectDef implements IStorageOpReceiver {
  // name of code file; for sprites the same as sprite name
  public name: string;
  public codeBlocks: CodeBlockDef[] = [];

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef | undefined,
    id: string | undefined,
    name: string | undefined = undefined) {

    super(storage, parent, id, 'CodeFile');
    this.name = (name) ? name : 'No name';

    storage.registerReceiver(this.id, this);
    if (id === undefined) {
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
    }
  }

  public createBlock(name: string, code: string) {
    this.codeBlocks.push(new CodeBlockDef(this._storage, this, undefined, name, code));
  }

  public get firstBlock(): CodeBlockDef | undefined { return (this.codeBlocks.length > 0) ? this.codeBlocks[0] : undefined }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): CodeFileDef {
    return new CodeFileDef(storage, parent, id, op.name);
  }

  public processSet(op: any): void {
    this.name = op.name;
  }

  public processAdd(childId: string, op: any): void {
    this.codeBlocks.push(CodeBlockDef.fromOp(this._storage, this, childId, op));
  }

  private createUpdateOp(): any {
    return {
      target: 'CodeFile',
      name: this.name,
      codeBlockCount: this.codeBlocks.length
    }
  }
}

