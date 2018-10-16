import {Component, Input} from "@angular/core";

import {Player} from '../models/player';

@Component({
  selector: "status",
  templateUrl: "../templates/status.html",
})
export class StatusComponent {
  @Input() player;
}
