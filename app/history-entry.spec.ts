import {HistoryEntry} from './history-entry';

describe("History entry class", function() {
    
  it("should set the command and result", function() {
    var h = new HistoryEntry('get all', "Sword taken.");
    expect(h.command).toEqual('get all');
    expect(h.results).toEqual('Sword taken.');
  });
 
});
