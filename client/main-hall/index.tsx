import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import MainHall from "./components/MainHall";
import store from "./store/index";

ReactDOM.render(
  <Provider store={store}>
    <MainHall />
  </Provider>,
  document.getElementById("root") as HTMLElement,
);
