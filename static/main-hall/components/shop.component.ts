import {Component,  OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';

@Component({
  template: `
  <h4>Marcos Cavielli's Weapons and Armour Shoppe</h4>
  <p>As you enter the weapon shop, Marcos Cavielli (the owner) comes from out of the back room and says, &quot;Well, as I live and breathe, if it isn't my old pal, {{player?.name}}!&quot;</p>
  <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  `,
})
export class ShopComponent implements OnInit  {
  player: Player;

  constructor(private _router: Router,
              private _route: ActivatedRoute,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    let id = Number(this._route.snapshot.params['id']);
    this._playerService.getPlayer(id).subscribe(
      data => {
        this.player = new Player();
        this.player.init(data);
        this.player.update();
      }
    );
  }

  gotoDetail() {
    this._router.navigate(['/player', this.player.id]);
  }
}
