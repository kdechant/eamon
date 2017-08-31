import {Component, OnInit}  from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {Player} from '../models/player';
import {AdventureService} from '../services/adventure.service';
import {StatusComponent} from "../components/status.component";
import {PlayerService} from "../services/player.service";
import {Adventure} from "../models/adventure";

@Component({
  template: `
  <h2><img src="/static/images/ravenmore/128/map.png"> Go on an adventure</h2>
  
  <div *ngIf="_playerService.player?.inventory.length === 0">
    <p><strong>The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now, my <span *ngIf="_playerService.player?.gender === 'm'">lad</span><span *ngIf="_playerService.player?.gender === 'f'">lass</span>, you're new here, and that's all right. But you'd best be buying some weapons and armor before you head out into the big, bad world.&quot;</strong></p>
    <div class="text-center margin-bottom-lg">
      <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
    </div>
  </div>
    
  <div *ngIf="_playerService.player?.inventory.length > 0 && _playerService.player?.armor_expertise === 0">
    <p><strong>The Irishman sees that you are preparing to leave the hall, and motions you over to the desk. &quot;Now, my <span *ngIf="_playerService.player?.gender === 'm'">lad</span><span *ngIf="_playerService.player?.gender === 'f'">lass</span>, you're new here, and that's all right. It's a tough world out there. Best try one of the 'Beginner' adventures for your first time out.&quot;</strong></p>
  </div>
  
  <p>Eamon contains many different adventures of many different styles. Some are fantasy or sci-fi, contain a quest or just hack-and-slash. Some are aimed at beginners and others are for veteran adventurers only. Choose your fate and perish (or profit)...</p>
  <div class="adventure-list">
    <div class="adventure-list-item"
      *ngFor="let adv of _adventureService.adventures">
      <div class="row">
        <div class="col-sm-2"><img src="/static/images/ravenmore/128/map.png" width="64"></div>
        <div class="col-sm-10">
          <h3><a (click)="gotoAdventure(adv)">{{adv.name}}</a></h3>
          <p *ngIf="adv.authors.length > 0">By: {{adv.authors}}</p>
        </div>
      </div>
      <p class="desc">{{adv.description}}</p>
      <div class="tags">
        <div class="tag" *ngFor="let tagname of adv.tags">
          {{tagname}}
        </div>
      </div>
      <div class="clearfix"></div>
    </div>
  </div>
  <div class="text-center margin-bottom-lg">
    <button class="btn"><a (click)="gotoDetail()">Go back to Main Hall</a></button>
  </div>
  `,
})
export class AdventureListComponent implements OnInit {

  constructor(private _router: Router,
              private _adventureService: AdventureService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    this._adventureService.getList();

    let id = parseInt(window.localStorage.getItem('player_id'));
    this._playerService.getPlayer(id);

  }

  gotoAdventure(adv: Adventure) {
    this._playerService.update().subscribe(
      data => {
        window.location.href = '/adventure/' + adv.slug;
      }
    );
  }

  gotoDetail() {
    this._router.navigate(['/hall']);
  }
}
