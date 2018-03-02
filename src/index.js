import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

const electron = window.electron;

ReactDOM.render(<App electron={electron} />, document.getElementById("root"));
registerServiceWorker();
