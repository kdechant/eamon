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
  
  <div class="container-fluid">
    <div class="row">
      
      <div class="col-md-2">
        <div class="tags tags-vertical mb-3">
          <div class="mb-2">Filter by tag:</div>
          <div class="tag"><a [ngClass]="{'font-weight-bold': _adventureService.tag === ''}" (click)="_adventureService.filterByTag('')">all</a></div>
          <div class="tag"><a [ngClass]="{'font-weight-bold': _adventureService.tag === 'featured'}" (click)="_adventureService.filterByTag('featured')">featured</a></div>
          <div class="tag" *ngFor="let tag of _adventureService.tags"><a [ngClass]="{'font-weight-bold': tag === _adventureService.tag}" (click)="_adventureService.filterByTag(tag)">{{tag}}</a> </div>
        </div>
        
        <div class="tags tags-vertical mb-3">
          <div class="mb-2">Filter by author:</div>
          <div class="tag"><a [ngClass]="{'font-weight-bold': _adventureService.author === ''}" (click)="_adventureService.filterByAuthor('')">all</a></div>
          <div class="tag" *ngFor="let author of _adventureService.authors"><a [ngClass]="{'font-weight-bold': author === _adventureService.author}" (click)="_adventureService.filterByAuthor(author)">{{author}}</a> </div>
        </div>
        
        <div class="tags tags-vertical mb-3">
          <div class="mb-2">Sort by:</div>
          <div class="tag" *ngFor="let sort_option of _adventureService.sort_options"><a [ngClass]="{'font-weight-bold': sort_option === _adventureService.sort_order}" (click)="_adventureService.sort(sort_option)">{{sort_option}}</a> </div>
        </div>        
      </div>
      
      <div class="adventure-list col-md-10">
        <div class="adventure-list-item"
          *ngFor="let adv of _adventureService.adventures">
          <div class="row">
            <div class="col-sm-2 d-none d-sm-block"><img src="/static/images/ravenmore/128/map.png" width="64"></div>
            <div class="col-sm-10">
              <div class="float-right text-secondary d-none d-md-block adv-id">#{{adv.id}}</div>
              <h3><a (click)="gotoAdventure(adv)">{{adv.name}}</a></h3>
              <p *ngIf="adv.authors_display.length > 0">By: {{adv.authors_display}}</p>
            </div>
            <div class="col-12">
              <p class="desc">{{adv.description}}</p>
              <div class="tags">
                <div class="tag" *ngFor="let tagname of adv.tags">
                  {{tagname}}
                </div>
              </div>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
        <div *ngIf="_adventureService.adventures?.length === 0">No adventures matched your filters. Try removing some filters.</div>
      </div>
      
    </div>
  </div>
  
  <div class="text-center margin-bottom-lg">
    <button class="btn" (click)="gotoDetail()">Go back to Main Hall</button>
  </div>
  `,
})
export class AdventureListComponent implements OnInit {

  constructor(private _router: Router,
              private _adventureService: AdventureService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {

    let id = parseInt(window.localStorage.getItem('player_id'));
    if (!id) {
      window.location.href = '/main-hall';
    }
    this._playerService.getPlayer(id);
    this._adventureService.getList();
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
