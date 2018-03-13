import React, { PureComponent } from "react";
import ClipboardHistory from "./components/clipboard-history";
import "./App.css";

const App = ({ electron }) => (
  <div>
    <div>Clipboard History</div>
    <ClipboardHistory electron={electron} />
  </div>
);

export default App;
