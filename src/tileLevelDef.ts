import { v4 as uuidv4 } from 'uuid';
import { x64Hash64 } from './hash/murmurhash3';
import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';
import { ObjectDef, IObjectDef } from './objectDef';
import { CostumeDef } from './costumeDef';
import { CodeFileDef } from './codeFileDef';
import { SpriteDef, SpriteDefCollection } from './SpriteDef';
import { Sprite } from './Sprite';

export type TileLevelProps = {
  /**
   * width in tiles
   */
  gridWidth: number;

  /**
   * height in tiles
   */
  gridHeight: number;

  /**
   * width of tile in pixels
   */
  tileWidth: number;

  /**
   * height of tile in pixels
   */
  tileHeight: number;
}

export type SpriteRef = {
  x: number;
  y: number;
  id: string;
  sprite: Sprite | undefined;
}

/**
 * ATT: all methods should be static. We will deserialize JS into this class without casting
 */
export class TileLevelDef extends ObjectDef implements IStorageOpReceiver {
  // @ts-ignore
  public codeFile: CodeFileDef;
  /** rows contains array of SpriteDef */
  public rows: any[] = [];
  public props: TileLevelProps;
  private _tilesId: string;
  private _sprites: SpriteDefCollection;

  public constructor(
    storage: IProjectStorage,
    parent: IObjectDef,
    id: string | undefined,
    props: TileLevelProps | undefined,
    sprites: SpriteDefCollection) {

    super(storage, parent, id, 'TileLevel')
    this._tilesId = this.id + '.tiles';

    // @ts-ignore
    this.props = props
    this._sprites = sprites;

    this._storage.registerReceiver(this.id, this);
    if (id === undefined) {
      this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
      this.codeFile = new CodeFileDef(storage, this, undefined);
      this.updateTiles();
    }
  }

  public static fromOp(
    storage: IProjectStorage,
    parent: IObjectDef, id: string,
    sprites: SpriteDefCollection,
    op: any): TileLevelDef {

    let level = new TileLevelDef(storage, parent, id, op.props, sprites);
    level.processSet(op);
    return level;
  }

  public processSet(op: any): void {
    this.props = op.props;
    this.rows = op.rows;
  }

  public processAdd(childId: string, op: any): void {
    if (childId === this._tilesId) {
      let tileOps = op as any[];
      tileOps.forEach(spriteDef => {
        let row = this.rows[spriteDef.y];
        row[spriteDef.x] = this._sprites.getById(spriteDef.id)
      });
    } else {
      this.codeFile = CodeFileDef.fromOp(this._storage, this, childId, op);
    }
  }

  private createUpdateOp() {
    return {
      target: 'TileLevel',
      props: this.props,
      rows: this.rows
    }
  }

  public setSize(gridWidth: number, gridHeight: number) {
    this.props.gridWidth = gridWidth;
    this.props.gridHeight = gridHeight;
    this._storage.setItem(this.id, this.parent?.id, this.createUpdateOp());
  }

  public setTiles(tiles: { sprite: SpriteDef, x: number, y: number }[]) {
    let updateTiles: any[] = [];
    tiles.forEach(tile => {
      let row: any[] = this.rows[tile.y];
      let spriteDef = this.createSpriteRef(tile.sprite.id, tile.x * this.props.tileWidth, tile.y * this.props.tileHeight);
      row[tile.x] = spriteDef;
      updateTiles.push(spriteDef);
    });

    // use ourself as parent for op
    this._storage.appendItems(this._tilesId, this.id, updateTiles);

    tiles.forEach(tile => {
      let row: any[] = this.rows[tile.y];
      let spriteDef = this.createSpriteRef(tile.sprite.id, tile.x * this.props.tileWidth, tile.y * this.props.tileHeight);
      row[tile.x] = spriteDef;
      updateTiles.push(spriteDef);
    });
  }

  public forEachTile(func: (sprite: Sprite) => void) {
    this.rows.forEach(row => {
      row.forEach((spriteRef: SpriteRef) => {
        if (spriteRef.sprite === undefined) {
          let spriteDef = this._sprites.getById(spriteRef.id);
          spriteRef.sprite = spriteDef?.createSprite({ x: spriteRef.x, y: spriteRef.y });
        }
        // @ts-ignore
        func(spriteRef.sprite);
      });
    });
  }

  private updateTiles() {
    if (this.props.gridHeight > this.rows.length) {
      for (let i = this.rows.length; i < this.props.gridHeight; i++) {
        this.rows.push([]);
      }
    } else {
      this.rows.length = this.props.gridHeight;
    }

    // update size of rows if needed
    for (let i = 0; i < this.rows.length; i++) {
      let row: any[] = this.rows[i];
      if (row.length < this.props.gridWidth) {
        for (let j = row.length; j < this.props.gridWidth; j++) {
          row.push(null);
        }
      } else {
        row.length = this.props.gridWidth;
      }
    }
  }

  private createSpriteRef(id: string, x: number, y: number): SpriteRef {
    return {
      id: id,
      x: x,
      y: y,
      sprite: undefined
    }
  }
}
