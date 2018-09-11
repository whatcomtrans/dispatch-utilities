import React, { PureComponent } from "react";
import styles from "./styles.scss";

class ClickToCall extends PureComponent {
  render() {
    const { display, phoneNumber, handleMakeCall } = this.props;

    return (
      <div className={styles.phoneNumber}>
        {display}
        <button
          className={styles.callButton}
          onClick={() => handleMakeCall(phoneNumber)}
        >
          Call
        </button>
      </div>
    );
  }
}

export default ClickToCall;
