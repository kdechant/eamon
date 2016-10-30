import {Loadable} from "./loadable";

// export class HintAnswer extends Loadable {
//
//   public index: string;
//   public answer: number;
//
// }

export class Hint extends Loadable {

  public id: number;
  public question: string;
  public index: string;
  public answers: Object[];

  // these are used by the display logic
  public current_index: number = 1;
  public is_open: boolean = false;

}
