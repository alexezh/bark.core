//import { Sprite } from "./sprite";

/// <reference path="sprite.ts" />

namespace bark {
  export interface ILevel {
    draw(ctx: any, x: number, w: number): void;
    setEditMode(edit: boolean): void;
    readonly pixelWidth: number;
    readonly pixelHeight: number;
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
    private _tileSprites: { [key: string]: Sprite } = {};
    private _rows: any[] = [];
    private _sprites: Sprite[] = [];
    private _tileW: number = 0;
    private _tileH: number = 0;
    private _gridW: number = 0;
    private _gridH: number = 0;
    private _editMode: boolean = true;

    public get pixelWidth() { return this._tileW * this._rows[0].length; }
    public get pixelHeight() { return this._tileH * this._rows.length; }
    public get gridHeight() { return this._gridH; }
    public get gridWidth() { return this._gridW; }

    public constructor(args: { gridWidth: number, gridHeight: number, tileWidth: number, tileHeight: number }) {
      this._tileW = args.tileWidth;
      this._tileH = args.tileHeight;
      this._gridW = args.gridWidth;
      this._gridH = args.gridHeight;

      this.updateTiles();
    }

    // registers tile sprite for string "c"
    public addSprite(sprite: Sprite, x: number, y: number) {
      sprite.setXY(x, y);
      this._sprites.push(sprite);
    }

    public setEditMode(edit: boolean) {
      this._editMode = edit;
    }

    public resize(gridWidth: number, gridHeight: number) {
      this._gridW = gridWidth;
      this._gridH = gridHeight;
      this.updateTiles();
    }

    public updateTiles() {
      if (this._rows.length < this._tileH) {
        for (let i = this._rows.length; i < this._tileH; i++) {
          this._rows.push([]);
        }
      } else {
        this._rows.length = this._tileH;
      }

      for (let i = this._rows.length; i < this._tileH; i++) {
        let row = this._rows[i];
        if (row.length < this._tileW) {
          for (let j = row.length; j < this._tileW; j++) {
            row.push(null);
          }
        } else {
          row.length = this._tileW;
        }
      }
    }

    // draw map from position x, y with (w,h) size
    public draw(ctx: any, x: number, y: number) {
      let startX = x / this._tileW;
      let startOffset = x % this._tileW;
      let endX = startX + this.pixelWidth / this._tileW + 1;
      let currentY = 0;
      this._rows.forEach(row => {
        for (let i = startX; i < endX; i++) {
          let sprite = row[i];
          if (sprite !== undefined && sprite !== null) {
            sprite.draw(ctx);
          }
        }

        currentY += this._tileH;
      });

      if (this._editMode) {
        this.drawGrid(ctx);
      }

      this._sprites.forEach(element => {
        element.draw(ctx);
      });
    }

    // return tile by position
    public getTile(x: number, y: number) {
      let row = this._rows[y];
      if (row === undefined)
        return null;
      return row[x];
    }

    public setTile(x: number, y: number, c: string) {
      let row = this._rows[y];
      if (row === undefined)
        return;

      if (x >= row.length)
        return;

      let sprite = this._tileSprites[c];
      if (sprite !== undefined) {
        sprite = sprite.clone(x * this._tileW, y * this._tileH);
        row[x] = sprite;
      } else {
        row[x] = null;
      }
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

      for (let i = this._gridH + 1; i < this._gridH; i++) {
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

      for (let i = 0; i < this._gridW; i++) {
        ctx.beginPath();
        ctx.moveTo(i * this._tileW, 0);
        ctx.lineTo(i * this._tileW, this._gridH * this._tileH);
        ctx.stroke();
      }

      for (let i = 0; i < this._gridW; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * this._tileH);
        ctx.lineTo(this._gridW * this._tileW, i * this._tileH);
        ctx.stroke();
      }
    }
  }
}