import {Component, Input} from "@angular/core";

@Component({
  selector: "hints",
  template: `
    <button class="btn hints-button" (click)="openHints()">Hints</button>
    <div class="hints" [class.hidden]="hidden">
      <div class="hint" *ngFor="let h of game.hints?.all">
        <p (click)="showAnswer(h)">
          <span class="glyphicon"
            [class.glyphicon-triangle-right]="!h.is_open"
            [class.glyphicon-triangle-bottom]="h.is_open"
            aria-hidden="true"></span>
          {{ h.question }}</p>
        <div class="hint-answers" [class.hidden]="!h.is_open">
          <p class="hint-answer" *ngFor="let a of h.answers" [class.hidden]="a.index !== h.current_index">
            {{ a.answer }}
          </p>
          <div class="hint-next-prev" [class.hidden]="h.answers.length < 2">
            <a (click)="prevAnswer(h)">prev</a>
            <a (click)="nextAnswer(h)">next</a>
          </div>
        </div>
      </div>
    </div>
    `,
})
export class HintsComponent {
  @Input() game;
  hidden = true;

  public openHints() {
    this.hidden = !this.hidden;
  }

  public showAnswer(hint) {
    hint.is_open = !hint.is_open;
  }

  public nextAnswer(hint) {
    hint.current_index++;
    if (hint.current_index > hint.answers.length) {
      hint.current_index = 1;
    }
    console.log(hint.current_index)
  }

  public prevAnswer(hint) {
    hint.current_index--;
    if (hint.current_index < 1) {
      hint.current_index = hint.answers.length;
    }
  }
}
