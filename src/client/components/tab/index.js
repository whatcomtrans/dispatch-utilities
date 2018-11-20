import React, { Component } from "react";
import styles from "./styles.scss";

class Tab extends Component {
  onClick = () => {
    const { label, onTabClick } = this.props;
    onTabClick(label);
  };

  render() {
    const { activeTab, label } = this.props;

    return (
      <li
        className={activeTab === label ? styles.activeTab : styles.tab}
        key={label}
        onClick={this.onClick}
      >
        {label}
      </li>
    );
  }
}

export default Tab;
