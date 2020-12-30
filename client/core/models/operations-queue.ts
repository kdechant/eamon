// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game;

/**
 * Operations queue class. Used for timing of game operations
 */
export class OperationsQueue {
  queue: any[];
  callback: Function;
  delay: number = 200;
  paused: boolean = false;

  constructor() {
    this.queue = [];
  }

  public run() {
    // console.log('queue run', this.queue);
    // TODO: should the counter be here or in the history manager?
    // if (this.paused) this.counter = 0;
    this.paused = false;

    // run the first operation in the queue (if any)
    if (this.queue.length) {
      let operation = this.queue.shift();
      // console.log('running operation:', operation);
      // things here:
      //  * a function we can call
      //  * a delay of X seconds
      //  * a pause
      if (operation === 'pause') {
        this.paused = true;
        return;
      } else if (typeof operation === 'string' && operation.substr(0,5) === 'delay') {
        let parts = operation.split(':');
        let time = parseFloat(parts[1]);
        console.log('delay', time);
        setTimeout(() => this.run(), time * 1000);
        return;
      } else {
        // It must be a function. Call it.
        operation();
        game.history.flush();
      }
    }

    // Check if we're done, and run the callback if so.
    if (!this.queue.length) {
      // console.log('running callback', this);
      this.callback();
    } else {
      // Not done. Schedule the next action to happen.
      // TODO: handle pauses here
      if (this.delay > 0) {
        setTimeout(() => this.run(), this.delay);
      } else {
        this.run();
      }
    }
  }

  /**
   * Pushes an operation onto the queue
   */
  push(operation: string|Function) {
    // console.log('queue push', operation);
    this.queue.push(operation);
  }

}
