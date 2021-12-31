import { Screen } from './screen';
import { Sprite } from './sprite';
import { ISpriteSource } from './spriteSource';
import { Input } from './input';
import { ILevel, TileLevel, Pos, PosKind } from './tilelevel';
import { Project, CodeBlockDef, CodeFileDef, CostumeDef, SpriteDef, TileLevelDef, ImageData } from './project';
import { IProjectStorage, ProjectLocalStorage, StorageOp, StorageOpKind } from './projectStorage';

export class Game {
  private _screen: Screen | null = null;
  private _canvas: any = null;

  // runs the game
  public run(screen: Screen) {
    this._screen = screen;
    this.tryRun();
  }

  public loadCanvas(canvas: any) {
    this._canvas = canvas;
    this.tryRun();
  }

  private tryRun() {
    //      if (this._screen !== null && this._canvas !== null) {
    //        this._screen.run(this._canvas);
    //      }
  }
}

export {
  Screen,
  Sprite,
  ISpriteSource,
  Input,
  ILevel,
  Pos,
  PosKind,
  TileLevel,

  // project
  Project,
  ImageData,
  CodeBlockDef,
  CodeFileDef,
  CostumeDef,
  SpriteDef,
  TileLevelDef,

  // project storage
  IProjectStorage,
  ProjectLocalStorage,
  StorageOp,
  StorageOpKind
}