import { Route, BrowserRouter as Router, Routes } from "react-router";
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
              <Route path="/main-hall/" element={<PlayerList />} />
              <Route path="/main-hall/register" element={<PlayerCreate />} />
              {/* non-exact route below is used so we can have child routes inside the component */}
              <Route path="/main-hall/">
                <Route path="*" element={<PlayerDetail />} />
              </Route>
            </Routes>
          </Router>
        </div>
      </div>
    </div>
  );
};

export default MainHall;
