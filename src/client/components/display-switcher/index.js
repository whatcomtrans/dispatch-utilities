import React from "react";
import styles from "./styles.scss";

const DisplaySwitcher = ({ consoleStation }) => (
  <div className={styles.iframeContainer}>
    <iframe
      title="Display Switcher"
      className={styles.iframe}
      src={`http://srvwebnode3:3031?id=${consoleStation}`}
    />
  </div>
);

export default DisplaySwitcher;
