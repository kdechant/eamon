import {Component, Input} from "@angular/core";

@Component({
  selector: "artifact",
  template: `{{ artifact.name }}
    <span class="artifact-status" *ngIf="artifact.type == 4 || artifact.type == 8">
      <span class="open" *ngIf="artifact.is_open">(open)</span>
      <span class="closed" *ngIf="!artifact.is_open">(closed)</span>
    </span>
    <span class="custom" *ngIf="artifact.inventory_message">({{ artifact.inventory_message }})</span>
    <span class="lit" *ngIf="artifact.is_lit && artifact.inventory_message == ''">(lit)</span>
    <span class="worn" *ngIf="artifact.is_worn && artifact.inventory_message == ''">(wearing)</span>
    <span class="ready" *ngIf="artifact.id == game.player.weapon_id">(ready weapon)</span>
    <div *ngIf="artifact.is_open">
      <div class="artifact-contents" *ngFor="let content of artifact.contents">{{ content.name }}</div>
    </div>
  `,
})
export class ArtifactComponent {
  @Input() game;
  @Input() artifact;
}
