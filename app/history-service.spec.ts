import {HistoryService} from './history.service';

describe("Command history", function() {
    
    var hist = new HistoryService(); // error happens unless I comment out this line

    it('should start with empty history', function() {
      expect(hist.history.length).toEqual(0);
    });
    
    it("should add entries to the history", function() {
      hist.push('n', 'Entering Great Hall.');
      expect(hist.history.length).toEqual(1);
      hist.push('e', 'Entering Throne Room.');
      expect(hist.history.length).toEqual(1);
      hist.push('get all', 'Sword taken.');
      expect(hist.history.length).toEqual(2);
    });
    
    it('should get the most recent command', function() {
      expect(hist.getLastCommand()).toEqual('get all');
    });
    
    it('should go backwards through commands', function() {
      expect(hist.getOlderCommand()).toEqual('get all');
      expect(hist.getOlderCommand()).toEqual('e');
      expect(hist.getOlderCommand()).toEqual('n');
    });
    
    it('should go forwards through commands', function() {
      expect(hist.getNewerCommand()).toEqual('e');
      expect(hist.getNewerCommand()).toEqual('get all');
    });
    
});
