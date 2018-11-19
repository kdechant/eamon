import * as React from 'react';

class History extends React.Component<any, any> {

  public render() {
    const game = this.props.game;
    return (
      <div className="history">
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
  // TODO: scroll to bottom on re-render

}

export default History;