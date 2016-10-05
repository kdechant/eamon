import {Component, Input} from "@angular/core";

@Component({
  selector: "status",
  templateUrl: "/static/core/components/status.html"
})
export class StatusComponent {
  @Input() game;
}
