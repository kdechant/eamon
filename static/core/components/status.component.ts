import {Component, Input} from "angular2/core";

import {Game} from "../models/game";

@Component({
  selector: "status",
  templateUrl: "/app/components/status.html",
})
export class StatusComponent {
  @Input() game;
}
