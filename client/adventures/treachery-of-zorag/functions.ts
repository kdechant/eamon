import {Monster} from "../../core/models/monster";
import Game from "../../core/models/game";

declare var game: Game;

/**
 * Talks to a monster
 * @param monster
 * @param subject
 */
export function talkTo(monster: Monster, subject: string) {
  // See if this monster has anything to say at all.
  if (!monster.data.talk) {
    if (monster.parent && monster.parent.data.talk) {
      // Group monster - for this case we talk to the 'parent' monster
      talkTo(monster.parent, subject);
    } else {
      game.history.write(`${monster.name} has nothing to say.`);
    }
    return;
  }

  let word = monster.data.talk.find(t => t.word === subject || t.word.indexOf(subject) !== -1);
  if (!word) {
    // No exact match. Look for a wildcard.
    word = monster.data.talk.find(t => t.word === '*');
  }
  if (word) {
    // withholding info?
    if (word.ignore !== 100 && (word.ignore === 0 || game.diceRoll(1, 100) > word.ignore - game.player.charisma)) {
      if (word.said && word.hasOwnProperty('repeat_effect')) {
        game.effects.print(word.repeat_effect);
      } else {
        game.effects.print(word.effect);
        if (word.reaction_change) {
          monster.reaction = word.reaction_change;
        }
      }
      word.said = true;
    } else {
      game.effects.print(word.withhold_effect);
    }
    game.triggerEvent('afterTalk', monster, subject, word);
  } else {
    game.history.write(`${monster.name} shrugs at you.`)
  }
}
