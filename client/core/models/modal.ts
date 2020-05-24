declare var game: any;

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
   * Whether a mock answer was used. Used to prevent double game clock ticks
   * when using mock answers in tests.
   * @type {boolean}
   */
  private mock_answer_used: boolean = false;

  /**
   * The easy way to ask a question of the player. Asks a question that takes a text answer.
   * The game will be paused waiting for player input.
   *
   * Example:
   * @param {string} question
   *  The text of the question
   * @param {Function} callback
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
   * The easy way to ask a yes/no question.
   * The game will be paused waiting for player input.
   *
   * Example:
   * @param {string} question
   *  The text of the question
   * @param {Function} callback
   *  The callback function that will be called when the player submits their answer. This takes one parameter, the
   *  answer (as a string).
   */
  public confirm(question: string, callback: Function) {
    let q = new ModalQuestion();
    q.type = 'multiple_choice';
    q.choices = ['Yes', 'No'];
    q.question = question;
    q.callback = callback;
    this.questions = [q];
    this.run();
  }

  /**
   * Shows a modal prompt (multiple choice version). The game will be paused waiting for player input.
   */
  public run() {
    game.pause();
    if (this.questions) {
      this.visible = true;
      this.current_question = this.questions[0];
      this.setupHotKeys();
      this.counter = 0;
      if (this.mock_answers.length > 0) {
        let answer = this.mock_answers.shift();
        console.log("mock answer: ", answer);
        this.mock_answer_used = true;
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
        this.setupHotKeys();
        if (this.mock_answers.length > 0) {
          let answer = this.mock_answers.shift();
          console.log("mock answer: ", answer);
          this.mock_answer_used = true;
          this.submit(answer);
        }
      }
    } else {
      this.close();
    }
  }

  /**
   * Configures automatic hot keys for each choice in the question. The key for each choice will be the
   * first character in the string, unless that key has already been assigned to a different choice.
   * In that case, it will proceed with the second character, third, and so on until it finds a
   * valid key. E.g., in the save dialog, slot #10 gets '0' as its hot key because '1' is already
   * taken by the first slot.
   */
  private setupHotKeys() {
    if (this.current_question.type !== 'multiple_choice') return;
    this.current_question.hotkey_positions = [];
    this.current_question.choices.forEach((c, index) => {
      for (let i = 0; i < c.length; i++) {
        let letter = c[i].toLowerCase();
        if (!this.current_question.hotkeys.hasOwnProperty(letter)) {
          this.current_question.hotkeys[letter] = c;
          this.current_question.hotkey_positions[index] = i;
          break;
        }
      }
    });
  }

  private close() {
    this.visible = false;
    if (!game.won && !game.died) {
      game.resume();
      if (!this.mock_answer_used) {
        // prevents double game clock tick during tests with mock answers
        game.tick();
      }
    }
  }

  /**
   * Returns the choice text for the current question, split into an array containing:
   *   * characters before the hotkey
   *   * the hotkey
   *   * characters after the hotkey
   * @param {number} index
   */
  public splitByHotkey(index) {
    let pos = this.current_question.hotkey_positions[index];
    let choice = this.current_question.choices[index];
    return [choice.slice(0, pos), choice.slice(pos, pos + 1), choice.slice(pos + 1)];
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

  /**
   * Keys that will trigger answers by key press. (multiple choice only)
   */
  hotkeys: { [key: string]: string; } = {};
  /**
   * Positions of the hotkeys within each answer. (multiple choice only)
   */
  hotkey_positions: number[];
}
