import {Component, Input} from "@angular/core";

@Component({
  selector: "status",
  templateUrl: "/static/core/templates/status.html"
})
export class StatusComponent {
  @Input() game;
  hiddenDesc = true;

  public toggleDesc() {
    this.hiddenDesc = !this.hiddenDesc;
  }
}
