import * as React from 'react';

class History extends React.Component<any, any> {

  private historyDiv;

  public componentDidMount() {
    this.scrollToBottom();
  }

  public componentDidUpdate() {
    this.scrollToBottom();
  }

  public scrollToBottom() {
    this.historyDiv.scrollTop = this.historyDiv.scrollHeight;
  }

  public render() {
    const game = this.props.game;
    return (
      <div className="history" ref={el => { this.historyDiv = el; }}>
        {game.history.history.map((entry, index) => (
          <div className="history-entry" key={index}>
            <p className="history-command">{entry.command}</p>
            {entry.results.map((line, index) => {
              const className = "history-results " + line.type;
              return (
                <p className={className} key={index}>{line.text}</p>
              )
            }
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default History;
