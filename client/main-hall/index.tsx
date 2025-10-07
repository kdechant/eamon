import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import MainHall from "./components/MainHall";
import store from "./store/index";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <MainHall/>
    </Provider>,
  </StrictMode>,
);
