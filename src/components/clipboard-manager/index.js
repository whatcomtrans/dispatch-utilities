import React, { PureComponent, Fragment } from "react";
import io from "socket.io-client";
import styles from "./styles.scss";
import shortId from "shortid";
const channelName = "A D1Comp";

class ClipboardManager extends PureComponent {
  constructor(props) {
    super(props);

    const { ipcRenderer, clipboard } = this.props.electron;
    //const socket = socketIOClient("10.0.0.72:80?");
    const socket = io("http://localhost:8080/clipboard", {
      query: { channelName: encodeURIComponent(channelName) },
    });

    this.state = {
      clipboardHistory: [clipboard.readText()],
      isConnected: false,
    };

    ipcRenderer.on("copy-text", (event, arg) => {
      socket.emit("copy-text", { clipboard: arg });
    });

    ipcRenderer.on("copy-image", (event, arg) => {
      socket.emit("copy-image", { clipboard: arg });
    });

    socket.on("clipboard", ({ channelNames, clipboardHistory }) => {
      if (channelNames.includes(channelName)) {
        this.setState({ clipboardHistory });
      }
    });

    socket.on("connect", () => {
      this.setState({ isConnected: true });
      this.props.createNotification({
        type: "success",
        content: <div>Connected</div>,
      });
    });

    socket.on("disconnect", () => {
      this.setState({ isConnected: false });
      this.props.createNotification({
        type: "error",
        content: <div>Disconnected</div>,
      });
    });

    ipcRenderer.send(`ready`);
  }

  onCopy = x => {
    const { clipboard, nativeImage } = this.props.electron;
    if (x.type === "image") {
      clipboard.writeImage(nativeImage.createFromDataURL(x.clipboard));
    } else {
      clipboard.writeText(x.clipboard);
    }
  };

  onClose = () => {
    this.setState({ shouldShowNotification: false });
  };

  renderClipboardItem = clipboardItem => {
    return clipboardItem.type === "image" ? (
      <img
        className={styles.clipboardImage}
        src={clipboardItem.clipboard}
        alt=""
      />
    ) : (
      <div>{clipboardItem.clipboard}</div>
    );
  };

  render() {
    const { clipboardHistory, isConnected } = this.state;

    return (
      <div className={styles.clipboardManager}>
        <div className={styles.clipboardManagerHeading}>Clipboard Manager</div>
        {clipboardHistory.map((clipboardItem, i) => (
          <Fragment key={shortId.generate()}>
            {i === 0 && (
              <div className={styles.currentClipboard}>
                Currently on clipboard:
                <div className={styles.currentClipboardItem}>
                  {this.renderClipboardItem(clipboardItem)}
                </div>
              </div>
            )}
            {i === 1 && (
              <div className={styles.clipboardHistoryHeading}>
                Clipboard History
              </div>
            )}
            {i !== 0 && (
              <div className={styles.clipboardItem}>
                {this.renderClipboardItem(clipboardItem)}
                <div className={styles.copyButtonOverlay}>
                  <button
                    className={styles.copyButton}
                    onClick={() => this.onCopy(clipboardItem)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    );
  }
}

export default ClipboardManager;
