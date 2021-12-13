export class Help {
  private _content: { [key: string]: string } = {};

  public add(key: string, content: string) {
    this._content[key] = content;
  }
}