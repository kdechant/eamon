export declare class GameError {
  public name: string;
  public message: string;
  public stack: string;
  constructor(message?: string);
}

export class CommandException extends GameError {
  constructor(m: string) {
    super(m);
    this.name = "Exception";

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CommandException.prototype);
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}
