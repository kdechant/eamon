import {describe, it, beforeEach, expect} from 'angular2/testing';

import {HistoryEntry} from "./history-entry";

describe("History entry class", function() {

  it("should set the command and result", function() {
    let h = new HistoryEntry("get all");
    expect(h.command).toEqual("get all");

    h.push("Sword taken", "normal");
    expect(h.results).toEqual([
      {text: "Sword taken", type: "normal"}
    ]);

    h.push("The dragon attacks you!", "danger");
    expect(h.results).toEqual([
      {text: "Sword taken", type: "normal"},
      {text: "The dragon attacks you!", type: "danger"}
    ]);

  });

});
