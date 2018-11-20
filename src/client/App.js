import React, { Component } from "react";
import Tabs from "./components/tabs";
import Tab from "./components/tab";
import Notification from "./components/notification";
import ClipboardManager from "./components/clipboard-manager";
import DisplaySwitcher from "./components/display-switcher";
import styles from "./App.scss";

const defaultNotification = {
  type: null,
  content: null,
  isVisible: false,
};

const consoleRE = /[d]\d/i;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: defaultNotification,
      channel: null,
      location: null,
    };
  }

  async componentDidMount() {
    const response = await fetch(
      `${
        process.env.NODE_ENV === "production" ? "http://srvwebnode3:3032" : ""
      }/api/channel?comp=${window.hostname}`
    );
    const { channel, location } = await response.json();

    if (!channel) {
      this.showNotification({
        type: "error",
        content: "Not Connected",
        isVisible: true,
      });
    }

    this.setState({ channel, location });
  }

  showNotification = notification => {
    this.setState({
      notification: {
        ...defaultNotification,
        ...notification,
        isVisible: true,
      },
    });
    if (notification.type !== "error") {
      setTimeout(() => {
        this.hideNotification();
      }, 3000);
    }
  };

  hideNotification = () => {
    this.setState(prevState => ({
      notification: { ...prevState.notification, isVisible: false },
    }));
  };

  render() {
    const { notification, channel, location } = this.state;
    let consoleStation;

    if (channel) {
      const match = channel.match(consoleRE);
      consoleStation = match && match[0].toLowerCase();
    }

    return (
      <div className={styles.app}>
        <Notification
          isVisible={notification.isVisible}
          type={notification.type}
          onExited={this.hideNotification}
        >
          {notification.content}
        </Notification>
        {channel && (
          <Tabs>
            <Tab label="Clipboard">
              <ClipboardManager
                channel={channel}
                location={location}
                createNotification={this.showNotification}
              />
            </Tab>
            <Tab label="Displays" lazyLoad={true}>
              <DisplaySwitcher consoleStation={consoleStation} />
            </Tab>
          </Tabs>
        )}
      </div>
    );
  }
}

export default App;
