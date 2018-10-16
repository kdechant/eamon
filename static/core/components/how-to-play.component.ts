import {Component, Input} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "how-to-play",
  templateUrl: "../templates/how-to-play.html",
})
export class HowToPlayComponent {
  @Input() game;
  public index: number = 1;

  constructor(private modalService: NgbModal) { }

  public open(content) {
    this.modalService.open(content, { size: 'lg' });
  }

}
