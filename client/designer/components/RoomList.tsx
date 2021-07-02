import * as React from 'react';
import { Link } from "react-router-dom";

import {useParams} from "react-router";
import AdventureContext from "../context";

function RoomList(): JSX.Element {
  const { slug } = useParams();

  return (
    <AdventureContext.Consumer>
      {state => {

        if (!state.adventure) {
          return <p>Loading {slug}...</p>;
        }

        let emptyMessage = '';
        if (!state.rooms.length) {
          emptyMessage = 'no rooms yet';
        }

        return (
          <div id="RoomList">
            <h3>Rooms</h3>

            <p>Choose a room:</p>

            <div className="container-fluid">
              <div className="row">

                <div className="adventure-list col-md-10">
                  {emptyMessage}
                  <table>
                    <thead>
                      <tr>
                        <td>#</td>
                        <td>Name</td>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(state.rooms).map((room) => {
                        return (
                          <tr className="room-list-item" key={room.id}>
                            <td>{room.id}</td>
                            <td><Link to={`${room.id}`}>{room.name}</Link></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </AdventureContext.Consumer>
  );
}

export default RoomList;
