import {HistoryEntry} from "./history-entry";

describe("History entry class", function() {

  test("command and result", function() {
    let h = new HistoryEntry("get all");
    expect(h.command).toEqual("get all");

    h.push("Sword taken", "normal");
    expect(h.results).toEqual([
      {markdown: false, text: "Sword taken", type: "normal"}
    ]);

    h.push("The dragon attacks you!", "danger");
    expect(h.results).toEqual([
      {markdown: false, text: "Sword taken", type: "normal"},
      {markdown: false, text: "The dragon attacks you!", type: "danger"}
    ]);

  });

});
