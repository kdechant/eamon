import * as React from "react";

function PlayerListItem(props: any) {

  const weapon_name = props.player.best_weapon ? props.player.best_weapon.name : "";
  const icon_url = '/static/images/ravenmore/128/' + props.player.icon + '.png';

  return (
    <div className="player col-sm-4" key={props.player.id}>
      <div className="icon"><img src={icon_url} width="96" height="96" /></div>
      <div className="name"><a><strong>{ props.player.name }</strong></a>
      <br/>
      HD: {props.player.hardiness} AG: {props.player.agility} CH: {props.player.charisma} <br/>
        {weapon_name}</div>
      <div className="delete"><a><span className="glyphicon glyphicon-trash" /></a></div>
    </div>
  );
}

export default PlayerListItem;
