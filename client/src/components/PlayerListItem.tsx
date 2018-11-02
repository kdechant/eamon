import * as React from "react";

function PlayerListItem(props: any) {
    return (
      <div className="player col-sm-4" key={props.player.id}>
        <div className="icon"><img src="/static/images/ravenmore/128/sword2.png" width="96" height="96" /></div>
        <div className="name"><a><strong>{ props.player.name }</strong></a>
        <br/>
        HD: {props.player.hardiness} AG: {props.player.agility} CH: {props.player.charisma} <br/>
        </div>
        <div className="delete"><a><span className="glyphicon glyphicon-trash" /></a></div>
      </div>
  );
}

export default PlayerListItem;
