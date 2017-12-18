import {Component, Input} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "hints",
  templateUrl: "/static/core/templates/hints.html",
})
export class HintsComponent {
  @Input() game;
  public index: number = 1;

  constructor(private modalService: NgbModal) { }

  public open(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  public nextHint() {
    this.index++;
    if (this.index > this.game.hints.length) {
      this.index = 1;
    }
  }

  public prevHint() {
    this.index--;
    if (this.index < 1) {
      this.index = this.game.hints.length;
    }
  }

  public showAnswer(hint) {
    hint.is_open = !hint.is_open;
  }

  public nextAnswer(hint) {
    if (hint.current_index >= hint.answers.length - 1) {
      hint.current_index = 0;
    } else {
      hint.current_index++;
    }
    console.log(hint.current_index)
  }

  public prevAnswer(hint) {
    if (hint.current_index == 1) {
      hint.current_index = hint.answers.length - 1;
    } else {
      hint.current_index--;
    }
    console.log(hint.current_index)
  }
}
