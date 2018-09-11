import React, { Component } from "react";
import Notification from "./components/notification";
import ClipboardManager from "./components/clipboard-manager";
import styles from "./App.scss";

const defaultNotification = {
  type: null,
  content: null,
  isVisible: false,
};

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
          <ClipboardManager
            channel={channel}
            location={location}
            createNotification={this.showNotification}
          />
        )}
      </div>
    );
  }
}

export default App;
