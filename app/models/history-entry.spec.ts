import {HistoryEntry} from "./history-entry";

describe("History entry class", function() {

  it("should set the command and result", function() {
    let h = new HistoryEntry("get all");
    expect(h.command).toEqual("get all");

    h.push("Sword taken");
    expect(h.results).toEqual(["Sword taken"]);

    h.push("Gold bars taken");
    expect(h.results).toEqual(["Sword taken", "Gold bars taken"]);

  });

});
