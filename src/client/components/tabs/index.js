import React, { Component, cloneElement } from "react";
import styles from "./styles.scss";

class Tabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: this.props.children[0].props.label,
    };
  }

  onTabClick = tab => {
    this.setState({ activeTab: tab });
  };

  render() {
    const { children } = this.props;
    const { activeTab } = this.state;

    return (
      <div className={styles.tabs}>
        <ul className={styles.tabsList}>
          {children.map(child => {
            return cloneElement(child, {
              onTabClick: this.onTabClick,
              activeTab,
              key: child.props.label,
            });
          })}
        </ul>
        <div>
          {children.map(child => {
            const { label, lazyLoad, children } = child.props;

            if (label !== activeTab && lazyLoad) {
              return null;
            }

            return (
              <div
                className={label !== activeTab ? styles.hidden : null}
                key={label}
              >
                {children}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Tabs;
