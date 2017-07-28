export declare class Error {
  public name: string;
  public message: string;
  public stack: string;
  constructor(message?: string);
}

export class CommandException extends Error {

  constructor(m: string) {
    super(m);
    this.name = "Exception";

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CommandException.prototype);
  }

  toString() {
    return this.name + ": " + this.message;
  }
}
