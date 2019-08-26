import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import Game from "../models/game";

class History extends React.Component<any, any> {

  private historyDiv;
  private timeout;

  public componentDidMount() {
    this.scrollToBottom();

    // key press handler for screen pause
    let game = Game.getInstance();
    document.addEventListener("keyup", (ev) => {
      let game = Game.getInstance();
      if (game.history.paused) {
        ev.preventDefault();
        game.history.display();
      }
    }, false);
  }

  public componentDidUpdate() {
    if (document.documentElement.clientWidth < 768) {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(this.scrollToBottom, 25);
    } else {
      this.scrollToBottom();
    }
  }

  public scrollToBottom() {
    if (document.documentElement.clientWidth < 768) {
      document.documentElement.scrollTop = document.documentElement.scrollHeight;
    } else {
      this.historyDiv.scrollTop = this.historyDiv.scrollHeight;
    }
  }

  public continue = () => {
    Game.getInstance().history.display();
  };

  public render() {
    const game = this.props.game;
    return (
      <div className="history" ref={el => { this.historyDiv = el; }}>
        {game.history.history.map((entry, index) => (
          <div className="history-entry" key={index}>
            <h3 className="history-command">{entry.command}</h3>
            {entry.results.map((line, index) => {
              const className = "history-results " + line.type;
              if (line.markdown) {
                return (
                  <div className={className} key={index}>
                    <ReactMarkdown source={line.text} escapeHtml={false}/>
                  </div>
                );
              }
              // plain text formatting is the default
              return <p className={className} key={index}>{line.text}</p>
            }
            )}
          </div>
        ))}
        {game.history.paused ? <button className="btn btn-info paused" onClick={this.continue}>
          Hit any key to continue...
        </button> : ""}
      </div>
    );
  }
}

export default History;
