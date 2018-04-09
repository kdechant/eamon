import {Component,  OnInit}  from '@angular/core';
import { Router } from '@angular/router';
import { Observable }     from 'rxjs/Observable';
import {
    AuthService,
    FacebookLoginProvider,
    GoogleLoginProvider
} from 'angular5-social-login';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

import {UuidService} from '../services/uuid.service';

import {Player} from '../models/player';
import {PlayerService} from '../services/player.service';


@Component({
  templateUrl: "/static/main-hall/templates/player-list.html",
})
export class PlayerListComponent implements OnInit  {

  constructor(
    private _router: Router,
    private _playerService: PlayerService,
    private socialAuthService: AuthService,
    private uuid: UuidService,
    private modalService: NgbModal
  ) { }

  public ngOnInit(): void {
    let social_id = window.localStorage.getItem('social_id');
    if (social_id) {
      this._playerService.login_id = social_id;
    }
    this._playerService.getList();
  }

  public socialSignIn(socialPlatform : string) {
    let socialPlatformProvider;
    if(socialPlatform == "facebook"){
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        console.log(socialPlatform + " sign in data : ", userData);
        this._playerService.login_id = userData.id;
        window.localStorage.setItem('social_id', userData.id);
        window.localStorage.setItem('social_platform', socialPlatform);
        this._playerService.linkLocalChars();
      }
    );
  }

  public socialSignOut(socialPlatform : string) {
    console.log(socialPlatform + " sign out : ", socialPlatform);
    window.localStorage.removeItem('social_id');
    window.localStorage.removeItem('social_platform');
    // set new uuid to clear the player list
    let token = this.uuid.uuid();
    window.localStorage.setItem('eamon_uuid', token);
    window.location.reload();
  }

  gotoPlayer(player: Player) {
    this._playerService.enterHall(player.id);
    this._router.navigate( ['/hall'] );
  }

  deletePlayer(player: Player) {
    if (confirm("Are you sure you want to delete " + player.name + "?")) {
      window.localStorage.setItem('player_id', null);
      this._playerService.delete(player).subscribe(
         data => {
           this._playerService.getList();
           return true;
         },
         error => {
           console.error("Error deleting player!");
           return Observable.throw(error);
         });
    }
  }
}
