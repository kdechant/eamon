import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';

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
            <h3 className="history-command">{entry.command}</h3>
            {entry.results.map((line, index) => {
              const className = "history-results " + line.type;
              return (
                <div className={className} key={index}>
                  <ReactMarkdown source={line.text} escapeHtml={false} />
                </div>
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
