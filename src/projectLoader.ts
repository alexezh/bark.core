import { Project, ScreenDef } from "Project";
import { Screen } from "screen";

/** intermediary between def and project */
export class ProjectLoader {
  private _screen: Screen;
  private _project: Project;

  public constructor(project: Project, screen: Screen) {
    this._project = project;
    this._screen = screen;
  }
}