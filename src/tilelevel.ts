import { TileLevelDef } from "TileLevelDef";
import { Sprite } from "./Sprite";

export interface ILevel {
  draw(ctx: any, x: number, w: number): void;
  setEditMode(edit: boolean): void;
}

export enum PosKind {
  Pixel,
  Grid
}

export class Pos {
  public kind: PosKind;
  public x: number;
  public y: number;

  constructor(kind: PosKind, x: number, y: number) {
    this.kind = kind;
    this.x = x;
    this.y = y;
  }
}

// TileLevel provides a way to render a map based on set of characters
// each character references sprite registered with addSprite call
export class TileLevel implements ILevel {
  private _def: TileLevelDef;
  private _tileSprites: { [key: string]: Sprite } = {};
  private _sprites: Sprite[] = [];
  private _editMode: boolean = true;

  public get TileLevelProps() { return this._def.props; }

  public constructor(def: TileLevelDef) {
    this._def = def;
  }

  public setEditMode(edit: boolean) {
    this._editMode = edit;
  }

  // draw map from position x, y with (w,h) size
  public draw(ctx: any, x: number, y: number) {
    //let startX = x / this._def.props.tileWidth;
    //let startOffset = x % this._def.props.tileHeight;
    //let endX = startX + this.pixelWidth / this._def.props.tileWidth + 1;
    //let currentY = 0;
    // TODO: add filtering
    this._def.forEachTile(sprite => {
      if (sprite !== undefined && sprite !== null) {
        sprite.draw(ctx);
      }
    });

    if (this._editMode) {
      this.drawGrid(ctx);
    }

    this._sprites.forEach(element => {
      element.draw(ctx);
    });
  }

  public getGridPosByPixelPos(x: number, y: number) {
    return new Pos(PosKind.Grid, Math.round(x / this._tileW), Math.round(y / this._tileH));
  }

  // returns block code by position
  public getTileByPixelPos(x: number, y: number): Sprite {
    let blockPos = this.getGridPosByPixelPos(x, y);
    return this.getTile(x, y);
  }

  public getPixelPosByGridPos(x: number, y: number) {
    return new Pos(PosKind.Pixel, x * this._gridW, y * this._gridH);
  }

  // search down for the first tile we overlap
  // TODO: should take sprite
  public lookDown(x: number, y: number) {
    let mapPos = this.getGridPosByPixelPos(x, y);

    for (let i = this._def.props.gridHeight + 1; i < this._def.props.gridHeight; i++) {
      let tile = this.getTile(mapPos.x, i);
      if (tile !== null) {
        return tile;
      }
    }

    return null;
  }

  private drawGrid(ctx: any) {
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#969696';

    let props = this._def.props;
    for (let i = 0; i < props.gridWidth; i++) {
      ctx.beginPath();
      ctx.moveTo(i * props.tileWidth, 0);
      ctx.lineTo(i * props.tileWidth, props.gridHeight * props.tileHeight);
      ctx.stroke();
    }

    for (let i = 0; i < props.gridWidth; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * props.tileHeight);
      ctx.lineTo(props.gridWidth * props.tileWidth, i * props.tileHeight);
      ctx.stroke();
    }
  }
}
