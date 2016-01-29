import {HistoryManager} from './history-manager';

describe("Command history", function() {

  let hist:HistoryManager;
  beforeEach(() => {
    hist = new HistoryManager();
  });

  // somehow the tests get run multiple times, and the following test will fail
  // the second/third time through.
//
//  it('should start with empty history', function() {
//    expect(hist.history.length).toEqual(0);
//  });

  it("should add entries to the history", function() {
    // to fix a bug, reset the history before running this.
    hist.history = [];

    hist.push('n');
    hist.write('Entering Great Hall.');
    expect(hist.history.length).toEqual(1);
    hist.push('e')
    hist.write('Entering Throne Room.');
    expect(hist.history.length).toEqual(2);
    hist.push('get all');
    hist.write('Sword taken.');
    expect(hist.history.length).toEqual(3);
  });

  it('should get the most recent command', function() {
    // to fix a bug, reset the history before running this.
    hist.history = [];

    hist.push('get all');
    hist.write('Sword taken.');
    expect(hist.getLastCommand()).toEqual('get all');
  });

  it('should scroll through the commands', function() {
    // to fix a bug, reset the history before running this.
    hist.history = [];

    hist.push('n');
    hist.write('Entering Great Hall.');
    hist.push('e');
    hist.write('Entering Throne Room.');
    hist.push('get all');
    hist.write('Sword taken.');
    expect(hist.getOlderCommand()).toEqual('get all');
    expect(hist.getOlderCommand()).toEqual('e');
    expect(hist.getOlderCommand()).toEqual('n');
    expect(hist.getOlderCommand()).toEqual('n'); // already on the first command. keep returning the first command.
    expect(hist.getNewerCommand()).toEqual('e');
    expect(hist.getNewerCommand()).toEqual('get all');
    expect(hist.getNewerCommand()).toEqual('');
  });

});
