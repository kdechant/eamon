import {Component,  OnInit}  from '@angular/core';
import {Router} from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {PlayerService} from '../services/player.service';

@Component({
  templateUrl: "../templates/witch.html",
  animations: [
    trigger('messageAnimation', [
      state('visible', style({
        opacity: 0.9,
        display: 'block',
      })),
      state('hidden',   style({
        opacity: 0,
        display: 'none',
      })),
      transition('hidden => visible', animate('200ms ease-in')),
      transition('visible => hidden', animate('200ms ease-out'))
    ]),
  ]
})
export class WitchComponent implements OnInit  {
  public messageState: any = {
    'hardiness': 'hidden',
    'agility': 'hidden',
    'charisma': 'hidden'
  };

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

  getAttributePrice(attribute_name: string) {
    if (this._playerService.player) {
      let base = 0;
      switch (attribute_name) {
        case 'hardiness':
          base = this._playerService.player.hardiness;
          break;
        case 'agility':
          base = this._playerService.player.agility;
          break;
        case 'charisma':
          base = this._playerService.player.charisma;
          break;
      }
      return Math.round(Math.pow(base, 3) / 100) * 100;
    }
  }

  buy(attribute_name: string) {
    let player = this._playerService.player;
    player.gold -= this.getAttributePrice(attribute_name);

    switch (attribute_name) {
      case 'hardiness':
        this._playerService.player.hardiness++;
        break;
      case 'agility':
        this._playerService.player.agility++;
        break;
      case 'charisma':
        this._playerService.player.charisma++;
        break;
    }

    let messageState = this.messageState;
    messageState[attribute_name] = 'visible';
    setTimeout(function() {
      messageState[attribute_name] = 'hidden'
    }, 2000);
  }

}
