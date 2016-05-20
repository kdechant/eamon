import {Game} from "../models/game";
import {initMockGame} from "../utils/testing";

describe("Artifact Repo", function() {

  beforeEach(() => {
    initMockGame();
  });

  it("should know if an artifact is within reach of the player", function() {
    let game = Game.getInstance();

    // something the player is carrying
    let torch = game.artifacts.getLocalByName('torch');
    expect(torch).not.toBeNull();
    expect(torch.id).toBe(9);

    // something in the room
    let bread = game.artifacts.getLocalByName('bread');
    expect(bread).not.toBeNull();
    expect(bread.id).toBe(7);

    // something that is elsewhere
    let chest = game.artifacts.getLocalByName('chest');
    expect(chest).toBeNull();

    // something that doesn't match any artifact in the game
    let spaceship = game.artifacts.getLocalByName('spaceship');
    expect(spaceship).toBeNull();

  });

});
