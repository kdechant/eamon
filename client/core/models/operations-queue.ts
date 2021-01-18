// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare const game;

type Callback = () => void;

/**
 * Operations queue class. Used for timing of game operations
 */
export class OperationsQueue {
  queue: (string|Callback)[];
  callback: Callback;
  delay_time = 100;
  paused = false;

  constructor() {
    this.queue = [];
  }

  public run(): void {
    this.paused = false;

    // run the first operation in the queue (if any)
    if (this.queue.length) {
      const operation = this.queue.shift();
      // 'operation' can be:
      //  * a function we can call
      //  * a delay of X seconds (string, in format 'delay:3')
      //  * a pause (string 'pause')
      if (typeof operation === 'function') {
        operation();
        // automatic screen pauses when output is long
        if (game.history.shouldPause()) {
          this.paused = true;
          game.refresh();
          return;
        }
        game.history.display();
      } else {
        if (operation === 'pause') {
          this.paused = true;
          game.refresh();
          return;
        } else if (operation.substr(0,5) === 'delay') {
          const parts = operation.split(':');
          const time = parseFloat(parts[1]);
          setTimeout(() => this.run(), time * 1000);
          return;
        }
      }
    }

    // Check if we're done, and run the callback if so.
    if (!this.queue.length) {
      this.callback();
    } else {
      // Not done. Schedule the next action to happen.
      if (this.delay_time > 0) {
        setTimeout(() => this.run(), this.delay_time);
      } else {
        this.run();
      }
    }
  }

  /**
   * Pushes an operation onto the queue
   */
  push(operation: Callback): void {
    this.queue.push(operation);
  }

  /**
   * Pushes a delay onto the queue
   */
  delay(seconds = 2): void {
    this.queue.push(`delay:${seconds}`);
  }

  /**
   * Pauses processing
   */
  pause(): void {
    this.queue.push(`pause`);
  }

  /**
   * Increases speed
   */
  faster(amount = 25): void {
    this.delay_time = Math.max(0, this.delay_time - amount);
  }

  /**
   * Decreases speed
   */
  slower(amount = 25): void {
    this.delay_time += amount;
  }

}
