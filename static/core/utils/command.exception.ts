export declare class Error {
  public name: string;
  public message: string;
  public stack: string;
  constructor(message?: string);
}

export class CommandException extends Error {

  constructor(public message: string) {
    super(message);
    this.name = "Exception";
    this.message = message;
    this.stack = (<any>new Error()).stack;
  }
  toString() {
    return this.name + ": " + this.message;
  }
}