import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import Game from "../models/game";

declare var game: Game;

class History extends React.Component<any, any> {

  private historyDiv;
  private timeout;

  public componentDidMount() {
    this.scrollToBottom();
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
      </div>
    );
  }
}

export default History;
