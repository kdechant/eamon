import {Game} from "../../core/models/game";

export class Modal {

  public questions: ModalQuestion[] = [];
  public current_question: ModalQuestion;
  private counter = 0;
  public visible: boolean = false;
  /**
   * Mock answers used with unit tests
   * @type {Array}
   */
  public mock_answers: string[] = [];

  /**
   * The easy way to ask a question of the player. Asks a question that takes a text answer.
   * The game will be paused waiting for player input.
   *
   * Example:
   * @param (string) question
   *  The text of the question
   * @param (Function) callback
   *  The callback function that will be called when the player submits their answer. This takes one parameter, the
   *  answer (as a string).
   */
  public show(question: string, callback: Function) {
    let q = new ModalQuestion();
    q.type = 'text';
    q.question = question;
    q.callback = callback;
    this.questions = [q];
    this.run();
  }

  /**
   * Shows a modal prompt (multiple choice version). The game will be paused waiting for player input.
   */
  public run() {
    Game.getInstance().pause();
    if (this.questions) {
      this.visible = true;
      this.current_question = this.questions[0];
      this.counter = 0;
      if (this.mock_answers.length > 0) {
        let answer = this.mock_answers.shift();
        console.log("mock answer: ", answer);
        this.submit(answer);
      }
    } else {
      console.error("tried to run modal without any questions");
    }
  }

  /**
   * Handles the submission of the modal. Runs the callback function and resumes the game clock.
   */
  public submit(value: string = null) {
    if (value !== null) {
      this.current_question.answer = value;
    }
    let result = this.current_question.callback(this.current_question.answer);
    if (result) {
      this.counter++;
      if (this.counter >= this.questions.length) {
        this.close();
      } else {
        this.current_question = this.questions[this.counter];
      }
    } else {
      this.close();
    }
  }

  private close() {
    this.visible = false;
    Game.getInstance().resume();
    Game.getInstance().tick();
  }
}

export class ModalQuestion {
  /**
   * The text of the question, shown as a label above the text box
   */
  question: string;
  /**
   * The answer received from the player. For text types, this is the value of the text box. For multiple-choice types,
   * this is the value of the button the player clicked.
   */
  answer: string = '';
  /**
   * Choices for the multiple-choice question type. Shown as buttons. This is not used with the 'text' question type
   */
  choices: string[] = [];
  /**
   * The question type - "text" or "multiple_choice"
   */
  type: string;
  /**
   * Callback function that will be called when the player answers the question
   */
  callback: Function;
}
