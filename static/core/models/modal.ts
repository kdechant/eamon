export class Modal {

  public text: string;
  public value: string;
  public callback: Function;
  public visible: boolean = false;

  // shows the modal
  public show(text: string, callback: Function) {
    this.text = text;
    this.callback = callback;
    this.visible = true;
  }

  // handles form submission
  public submit() {
    this.visible = false;
    this.callback(this.value);
  }

}
