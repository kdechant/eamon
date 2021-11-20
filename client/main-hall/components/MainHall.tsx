import * as React from 'react';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import PlayerCreate from "./PlayerCreate";
import PlayerDetail from "./PlayerDetail";
import PlayerList from "./PlayerList";

const MainHall = () => {
  return (
    <div className="container-fluid" id="app">
      <div className="parchment">
        <div className="parchment-inner">
          <Router>
            <Routes>
              <Route path="/main-hall/" element={<PlayerList />}/>
              <Route path="/main-hall/register" element={<PlayerCreate />}/>
              {/* non-exact route below is used so we can have child routes inside the component */}
              <Route path="/main-hall/*" element={<PlayerDetail />}/>
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default MainHall;
