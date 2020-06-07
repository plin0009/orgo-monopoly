import React from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import HomePage from "./pages/Home";
import RoomPage from "./pages/Room";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/:roomId" exact component={RoomPage} />
      </Switch>
    </Router>
  );
};

export default App;
