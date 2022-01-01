import AsyncEventSource from './AsyncEventSource'
import { CodeFileDef } from './codeFileDef';
import { ObjectDef, IObjectDef } from './objectDef';
import { CostumeDef } from './costumeDef';
import { IProjectStorage, IStorageOpReceiver } from './projectStorage';

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class SpriteDef extends ObjectDef implements IStorageOpReceiver {
  // user defined name of the sprite
  public name: string = 'No name';
  public width: number = 0;
  public height: number = 0;
  // @ts-ignore
  public codeFile: CodeFileDef;
  public costumes: CostumeDef[] = [];

  /**
   * called when costume changes
   */
  public onCostumeChange = new AsyncEventSource<(costume: CostumeDef) => void>();

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef | undefined,
    id: string | undefined,
    name: string) {

    super(storage, parent, id, 'Sprite');
    this.name = name;

    storage.registerReceiver(this.id, this);

    // add one costume by default
    if (id === undefined) {
      this.codeFile = new CodeFileDef(storage, this, undefined, name);
      storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
      this.costumes.push(new CostumeDef(storage, this, undefined));
    }
  }

  public get firstCostume(): CostumeDef { return this.costumes[0] }

  public findCostume(id: string): CostumeDef | undefined {
    for (let i = 0; i < this.costumes.length; i++) {
      if (this.costumes[i].id == id) {
        return this.costumes[i];
      }
    }

    return undefined;
  }

  public static fromOp(storage: IProjectStorage, parent: IObjectDef, id: string, op: any): SpriteDef {
    let sprite = new SpriteDef(storage, parent, id, op.name);
    sprite.processSet(op);
    return sprite;
  }

  public processSet(op: any): void {
    this.name = op.name;
    this.width = op.width;
    this.height = op.height;
  }

  public processAdd(childId: string, op: any): void {
    this.costumes.push(CostumeDef.fromOp(this._storage, this, childId, op));
  }

  private createUpdateOp() {
    return {
      target: 'Sprite',
      name: this.name,
      width: this.width,
      height: this.height,
      costumeCount: this.costumes.length
    }
  }

  public static isEqual(a: SpriteDef | undefined, b: SpriteDef | undefined): boolean {
    if (a === undefined && b === undefined) {
      return true;
    } else if (a === undefined || b === undefined) {
      return false;
    } else {
      return a === b;
    }
  }
}

