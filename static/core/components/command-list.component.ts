import {Component, Input} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "command-list",
  templateUrl: "../templates/command-list.html",
})
export class CommandListComponent {
  @Input() game;
  keys: string[] = [];

  constructor(private modalService: NgbModal) { }

  public open(content) {
    if (this.keys.length === 0 && typeof this.game !== 'undefined') {
      this.keys = Object.keys(this.game.command_parser.available_verbs)
        .filter(c => c !== 'xgoto' && c !== 'xdebugger' && c !== 'xaccio');
    }

    this.modalService.open(content);
  }

}
