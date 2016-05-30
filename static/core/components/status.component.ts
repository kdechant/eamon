import {Component, Input} from "@angular/core";

import {ArtifactComponent} from "../components/artifact.component";

@Component({
  selector: "status",
  templateUrl: "/static/core/components/status.html",
  directives: [ArtifactComponent]
})
export class StatusComponent {
  @Input() game;
}
