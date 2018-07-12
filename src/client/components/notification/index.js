import React from "react";
import styles from "./styles.scss";
import { Transition } from "react-transition-group";

const Notification = ({ type, isVisible, children, onExited }) => (
  <Transition in={isVisible} timeout={1000} onExited={onExited}>
    {state => {
      return (
        <div
          className={`${styles[state]} ${styles[type]}`}
          ref={notification => (this.notification = notification)}
        >
          {children}
        </div>
      );
    }}
  </Transition>
);

export default Notification;
