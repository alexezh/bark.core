import AsyncEventSource from './AsyncEventSource';
import { IProjectStorage, IStorageOpReceiver, StorageOp, StorageOpKind } from './IProjectStorage';
import { ProjectLocalStorage } from './ProjectStorage';
import { ObjectDef, IObjectDef } from './ObjectDef';
import { CodeFileDef } from './CodeFileDef';
import { SpriteDef, SpriteDefCollection } from './SpriteDef';
import { TileLevelDef, TileLevelProps } from './TileLevelDef';
import { ScreenDef } from './ScreenDef';

/**
 * utility method for managing project
 */
export class Project {
  private readonly _screen: ScreenDef;
  private readonly _storage: ProjectLocalStorage;

  public get storage(): IProjectStorage { return this._storage; }
  public get screen(): ScreenDef { return this._screen; }

  public constructor(storage: ProjectLocalStorage, def: ScreenDef) {
    this._storage = storage;
    this._screen = def;
  }

  public static createEmptyProject(): Project {
    let storage = new ProjectLocalStorage();

    let levelProps = {
      gridWidth: 48,
      gridHeight: 8,
      tileWidth: 32,
      tileHeight: 32
    };

    let gridHeight = 8;
    let screen = new ScreenDef(
      storage,
      {
        screenWidth: levelProps.tileWidth * 20,
        screenHeight: levelProps.tileHeight * 8
      });

    screen.createLevel(levelProps);

    // create a default sprite
    screen.createSprite('Leia');
    screen.createSprite('Floor');
    screen.createSprite('Air');

    screen.level.setTiles([
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 0, y: 0 },
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 1, y: 0 },
      { sprite: screen.sprites.getByNameOrThrow('Leia'), x: 2, y: 0 }]);

    screen.codeFile.createBlock('updateScene', '// put code to update scene here');

    return new Project(storage, screen);
  }

  public forEachSprite(func: (file: SpriteDef) => void) {
    this.screen.sprites.forEach((x: SpriteDef) => func(x));
  }

  public forEachCodeFile(func: (file: CodeFileDef) => void) {
    func(this.screen.codeFile);
    if (this.screen.level !== undefined) {
      func(this.screen.level?.codeFile);
    }
    this.screen.sprites.forEach((x: SpriteDef) => func(x.codeFile));
  }

  public findCodeFileById(id: string): CodeFileDef | undefined {
    if (this.screen.codeFile.id === id) {
      return this.screen.codeFile;
    }

    if (this.screen.level !== undefined && this.screen.level.codeFile.id === id) {
      return this.screen.level.codeFile;
    }

    return this.screen.sprites.find((x: SpriteDef) => x.codeFile.id === id)?.codeFile;
  }

  public findSpriteById(id: string): SpriteDef | undefined {
    return this.screen.sprites.getById(id);
  }

  public registerOnChange() {

  }
}

//let project = Project.createEmptyProject();
//export { project };