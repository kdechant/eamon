import {Component} from 'angular2/core';

import {Output} from './output';

@Component({
  selector: 'output',
  inputs: ['output'],
  template: `
    <div class="output">
      <div *ngFor="#out of output">
        <p class="past-command">{{out.command}}</p>
        <p class="past-output">{{out.results}}</p>
      </div>
    </div>
    `,
})
export class OutputComponent {
  public output: Output[];
}