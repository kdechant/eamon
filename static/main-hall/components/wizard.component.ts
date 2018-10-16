import {Component,  OnInit}  from '@angular/core';
import {Router} from '@angular/router';

import {PlayerService} from '../services/player.service';
import {Game} from "../../core/models/game";

@Component({
  templateUrl: "../templates/wizard.html",
})
export class WizardComponent implements OnInit  {
  public message: string;
  public error: string;

  public spells: any[] = [
    {
      'name': "blast",
      'description': "Damages one enemy. Can also be used to break open some doors and chests.",
      'price': 1000
    },
    {
      'name': "heal",
      'description': "Heals you or a friend.",
      'price': 500
    },
    {
      'name': "power",
      'description': "Has an unpredictable effect which is different in every adventure.",
      'price': 100
    },
    {
      'name': "speed",
      'description': "Doubles your agility for a time, making you a better fighter.",
      'price': 4000
    }
  ];

  constructor(private _router: Router,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    let id = parseInt(window.localStorage.getItem('player_id'));
    this._playerService.getPlayer(id);
  }

  gotoDetail() {
    this._router.navigate(['/hall']);
  }

  buy(spell_name: string) {
    let player = this._playerService.player;
    this.error = "";
    this.message = "";
    let spell = this.spells.find(x => x.name === spell_name);
    if (spell.price > player.gold) {

      this.error = "When Hokas sees that you don't have enough to pay him, he stalks back to the bar, muttering about youngsters who should be turned into frogs.";

    } else if (player.spell_abilities_original[spell.name] >= 90) {

      this.error = 'Hokas says, "I ought to take your gold anyway, but you already know that spell as well as I can teach it!" Shaking his head sadly, he returns to the bar.';

    } else if (player.spell_abilities_original[spell.name]) {
      // improving ability

      this.message = 'Hokas says, "Didn\'t learn it well enough the first time, eh? Well, we could all use a little brushing up." He teaches you some new techniques, takes his fee, and returns to his stool on the bar. As you walk away, you hear him order a Double Dragon Blomb.';
      let possible_increase = 100 - player.spell_abilities_original[spell.name];
      let inc = Math.floor(possible_increase / 4 + Game.getInstance().diceRoll(1, possible_increase / 2));
      player.spell_abilities_original[spell.name] += inc;
      player.gold -= spell.price;

    } else {
      // learning for the first time

      this.message = "Hokas teaches you your spell, takes his fee, and returns to his stool on the bar. As you walk away, you hear him order a Double Dragon Blomb.";
      player.spell_abilities_original[spell.name] = Game.getInstance().diceRoll(1, 50) + 25;
      player.gold -= spell.price;

    }
  }

}
