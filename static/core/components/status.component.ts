import {Component, Input} from "angular2/core";

import {Game} from "../models/game";

@Component({
  selector: "status",
  templateUrl: "/static/core/components/status.html",
})
export class StatusComponent {
  @Input() game;
}
