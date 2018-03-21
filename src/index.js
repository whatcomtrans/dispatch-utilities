import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";

const electron = window.electron;

ReactDOM.render(<App electron={electron} />, document.getElementById("root"));
