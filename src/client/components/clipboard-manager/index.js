import React, { PureComponent, Fragment } from "react";
import io from "socket.io-client";
import styles from "./styles.scss";
import shortId from "shortid";
const { ipcRenderer, clipboard, nativeImage } = window.electron;

class ClipboardManager extends PureComponent {
  constructor(props) {
    super(props);

    const socket = io(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.REACT_APP_SERVER
          : ""
      }/clipboard`,
      {
        query: { channel: encodeURIComponent(this.props.channel) },
      }
    );

    this.state = {
      clipboardHistory: [clipboard.readText() || clipboard.readImage()],
    };

    ipcRenderer.on("copy-text", (event, arg) => {
      socket.emit("copy-text", { clipboard: arg });
    });

    ipcRenderer.on("copy-image", (event, arg) => {
      socket.emit("copy-image", { clipboard: arg });
    });

    socket.on("clipboard", ({ channels, clipboardHistory }) => {
      if (channels.includes(this.props.channel)) {
        this.setState({ clipboardHistory }, () => {
          if (this.state.clipboardHistory.length > 0) {
            this.onCopy(this.state.clipboardHistory[0]);
          }
        });
      }
    });

    socket.on("connect", () => {
      this.props.createNotification({
        type: "success",
        content: <div>Connected</div>,
      });
    });

    socket.on("disconnect", () => {
      this.props.createNotification({
        type: "error",
        content: <div>Not Connected</div>,
      });
    });

    ipcRenderer.send(`ready`);
  }

  onCopy = clipboardItem => {
    if (!clipboardItem) {
      return;
    }

    if (clipboardItem.type === "image") {
      clipboard.writeImage(
        nativeImage.createFromDataURL(clipboardItem.content)
      );
    } else {
      clipboard.writeText(clipboardItem.content);
    }
  };

  onClose = () => {
    this.setState({ shouldShowNotification: false });
  };

  renderClipboardItem = clipboardItem => {
    return clipboardItem.type === "image" ? (
      <img
        className={styles.clipboardImage}
        src={clipboardItem.content}
        alt=""
      />
    ) : (
      <div>{clipboardItem.content}</div>
    );
  };

  render() {
    const { clipboardHistory } = this.state;

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
