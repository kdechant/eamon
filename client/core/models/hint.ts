import {Loadable} from "./loadable";

export class Hint extends Loadable {

  public id: number;
  public question: string;
  public index: string;
  public answers: Object[];

  // these are used by the display logic
  public current_index: number = 0;
  public is_open: boolean = false;

}
