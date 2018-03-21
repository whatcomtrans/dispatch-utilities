import React from "react";
import ClipboardManager from "./components/clipboard-manager";
import styles from "./App.scss";

const App = ({ electron }) => (
  <div className={styles.app}>
    <ClipboardManager electron={electron} />
  </div>
);

export default App;
