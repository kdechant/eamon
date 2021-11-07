import * as React from 'react';
import {useParams} from "react-router";

import AdventureContext from "../contexts/adventure";
import {RoomLink} from "./common";

function RoomList(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const context = React.useContext(AdventureContext);

  if (!context.adventure) {
    return <p>Loading {slug}...</p>;
  }

  let emptyMessage = '';
  if (!context.rooms.all.length) {
    emptyMessage = 'no rooms yet';
  }

  return (
    <div id="RoomList">
      <h3>Rooms</h3>

      <p>Choose a room:</p>

      <div className="container-fluid">
        <div className="row">
          {emptyMessage}
          <table className="table">
            <thead>
              <tr>
                <td>#</td>
                <td>Name</td>
              </tr>
            </thead>
            <tbody>
              {context.rooms.all.map((room) => {
                return (
                  <tr className="room-list-item" key={room.id}>
                    <td>{room.id}</td>
                    <td><RoomLink id={room.id} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RoomList;
