import Game from "../../core/models/game";

// The "game" object contains the event handlers and custom commands defined for the loaded adventure.
declare var game: Game;

export function talkTo(monster, subject) {
  let keyword = monster.data.talk.find(t =>
    t.word === subject || t.word.indexOf(subject) !== -1);
  if (!keyword) {
    keyword = monster.data.talk.find(t => t.word === '*');
  }
  if (keyword) {
    if (keyword.ignore) {
      // not implementing percentage here; it's on home PC
      game.effects.print(keyword.withhold_effect);
    } else {
      if (keyword.seen && keyword.repeat_effect) {
        game.effects.print(keyword.repeat_effect);
      } else {
        game.effects.print(keyword.effect);
      }
      if (keyword.said !== -1) {
        keyword.said = true;
      }
      if (keyword.hasOwnProperty('reaction_change')) {
        monster.reaction = keyword.reaction_change;
      }
      game.triggerEvent('afterTalk', monster, subject, keyword);
    }
  } else {
    game.history.write(`${monster.name} doesn't know anything about that.`);
  }
}
