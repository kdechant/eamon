import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import {useEffect, useRef, useState} from "react";
import {HistoryManager} from "../models/history-manager";


type HistoryProps = {
  historyManager: HistoryManager;
}


const History: React.FC<HistoryProps> = (props) => {
  const [scrollTimeout, setScrollTimeout] = useState<number | null>(null);
  const historyDiv = useRef(null);

  const scrollToBottom = () => {
    if (document.documentElement.clientWidth < 768) {
      // Mobile screen. History scrolls with the main window.
      document.documentElement.scrollTop = document.documentElement.scrollHeight;
    } else {
      // Large screen. History has its own scroll bar.
      historyDiv.current.scrollTop = historyDiv.current.scrollHeight;
    }
  }

  useEffect(() => {
    if (document.documentElement.clientWidth < 768) {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      const timeoutID = window.setTimeout(scrollToBottom, 25);
      setScrollTimeout(timeoutID);
    } else {
      scrollToBottom();
      setScrollTimeout(null);
    }
  }, [props.historyManager.current_entry.results.length]);

  return (
    <div className="history" ref={historyDiv}>
      {props.historyManager.history.map((entry, index) => (
        <div className="history-entry" key={index}>
          <h3 className="history-command">{entry.command}</h3>
          {entry.results.map((line, index) => {
            const className = "history-results " + line.type;
            if (line.markdown) {
              return (
                <div className={className} key={index}>
                  <ReactMarkdown children={line.text} rehypePlugins={[rehypeRaw]}/>
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

export default History;
