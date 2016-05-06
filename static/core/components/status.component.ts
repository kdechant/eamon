import {Component, Input} from "@angular/core";

import {Game} from "../models/game";

@Component({
  selector: "status",
  templateUrl: "/static/core/components/status.html",
})
export class StatusComponent {
  @Input() game;
}
