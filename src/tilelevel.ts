//import { Sprite } from "./sprite";

/// <reference path="sprite.ts" />

namespace bark {
  export interface ILevel {
    draw(ctx: any, x: number, w: number): void;
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
    private _tileW: number;
    private _tileH: number;
    private _gridW: number;
    private _gridH: number;

    public get pixelWidth() { return this._tileW * this._rows[0].length; }
    public get pixelHeight() { return this._tileH * this._rows.length; }
    public get gridHeight() { return this._gridH; }
    public get gridWidth() { return this._gridW; }

    public constructor(args: { gridW: number, gridH: number, tileW: number, tileH: number }) {
      this._tileW = args.tileW;
      this._tileH = args.tileH;
      this._gridW = args.gridW;
      this._gridH = args.gridH;
    }

    // registers tile sprite for string "c"
    public addTileSprite(c: string, sprite: Sprite) {
      this._tileSprites[c] = sprite;
    }

    public getTileSprite(c: string) {
      return this._tileSprites[c];
    }

    public addSprite(sprite: Sprite, x: number, y: number) {
      sprite.setXY(x, y);
      this._sprites.push(sprite);
    }

    // create empty map
    public createEmptyMap(w: number, h: number) {
      for (let i = 0; i < h; i++) {
        let row = [];
        for (let j = 0; j < w; j++) {
          row.push(null);
        }
        this._rows.push(row);
      }
    }

    // load map as row of strings
    // each char corresponds to sprite registered with createSprite call
    public loadMap(rows: any[]) {
      let rowY = 0;
      rows.forEach(inputRow => {
        let spriteRow = [];
        for (let i = 0; i < inputRow.length; i++) {
          let c = inputRow[i];
          let sprite = this._sprites[c];
          if (sprite !== undefined) {
            sprite = sprite.clone(i * this._tileW, rowY);
            spriteRow.push(sprite);
          } else {
            spriteRow.push(null);
          }
        };

        this._rows.push(spriteRow);
        rowY += this._tileH;
      });
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
  }
}