import React, { PureComponent, Fragment } from "react";
import io from "socket.io-client";
import styles from "./styles.scss";
import shortId from "shortid";
import packageJson from "../../../../package.json";
import ClickToCall from "../click-to-call";
import { findPhoneNumbers } from "libphonenumber-js";
const { clipboard, nativeImage, remote } = window.electron;
const logger = remote.require("electron-log");
const callerDn = "97{0}3";

class ClipboardManager extends PureComponent {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const locationNumberIndex = location.search(/\d/);
    const dn = callerDn.replace(
      "{0}",
      location.substring(locationNumberIndex, locationNumberIndex + 1)
    );

    if (locationNumberIndex === -1 || dn.length !== 4) {
      logger.error("Invalid device location", { location });
    }

    this.state = {
      clipboardHistory: [],
      intervalId: null,
      dn,
    };
  }

  componentDidMount() {
    const socket = io(
      `${
        process.env.NODE_ENV === "production" ? "http://srvwebnode3:3032" : ""
      }/clipboard`,
      {
        query: {
          channel: encodeURIComponent(this.props.channel),
          version: packageJson.version,
        },
      }
    );

    socket.on("clipboard", ({ channels, clipboardHistory }) => {
      if (channels.includes(this.props.channel)) {
        this.setState({ clipboardHistory }, () => {
          if (this.state.clipboardHistory.length > 0) {
            logger.info(`${this.props.channel} received clipboard event`);
            this.onCopy(this.state.clipboardHistory[0]);
          }
        });
      }
    });

    socket.on("connect", () => {
      logger.info(`${this.props.channel} connected`);
      this.props.createNotification({
        type: "success",
        content: <div>Connected</div>,
      });
    });

    socket.on("disconnect", () => {
      logger.info(`${this.props.channel} disconnected`);
      this.props.createNotification({
        type: "error",
        content: <div>Not Connected</div>,
      });
    });

    setInterval(() => {
      const clipboardFormats = clipboard.availableFormats();
      const clipboardState = {};
      for (let i = 0; i < clipboardFormats.length; i++) {
        const format = clipboardFormats[i];
        if (format === "text/plain") {
          clipboardState.text = clipboard.readText();
        } else if (format === "text/html") {
          clipboardState.html = clipboard.readHTML();
        } else if (format === "text/rtf") {
          clipboardState.rtf = clipboard.readRTF();
        } else if (format.indexOf("image") > -1) {
          clipboardState.image = clipboard.readImage().toDataURL();
        } else {
          logger.warn("Encountered unsupported clipboard format", format);
        }
      }

      let previousClipboardState =
        (this.state.clipboardHistory.length &&
          this.state.clipboardHistory[0]) ||
        {};

      if (
        previousClipboardState.text !== clipboardState.text ||
        previousClipboardState.html !== clipboardState.html ||
        previousClipboardState.rtf !== clipboardState.rtf ||
        previousClipboardState.image !== clipboardState.image
      ) {
        socket.emit("clipboard", { clipboard: clipboardState });
      }
    }, 1000);
  }

  onCopy = clipboardItem => {
    if (!clipboardItem) {
      return;
    }

    logger.info(
      `${this.props.channel} wrote to the clipboard: ${JSON.stringify(
        clipboardItem
      )}`
    );

    clipboard.write({
      text: clipboardItem.text,
      html: clipboardItem.html,
      image:
        clipboardItem.image &&
        nativeImage.createFromDataURL(clipboardItem.image),
      rtf: clipboardItem.rtf,
    });
  };

  onClose = () => {
    this.setState({ shouldShowNotification: false });
  };

  handleMakeCall = async number => {
    const { dn } = this.state;
    fetch(
      `${
        process.env.NODE_ENV === "production" ? "http://srvwebnode3:3032" : ""
      }/api/call`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ number, dn }),
      }
    );
  };

  renderClickToCall = clipboardItem => {
    if (!clipboardItem.text) {
      return null;
    }

    const parsedPhoneNumbers = findPhoneNumbers(
      clipboardItem.text,
      "US"
    ).filter(phoneNumber => phoneNumber.country === "US");
    if (!parsedPhoneNumbers.length) {
      return null;
    }

    const phoneNumbers = parsedPhoneNumbers.map(phoneNumber => ({
      display: clipboardItem.text.substring(
        phoneNumber.startsAt,
        phoneNumber.endsAt
      ),
      phone: phoneNumber.phone,
    }));

    return (
      <div>
        {phoneNumbers.map(phoneNumber => (
          <ClickToCall
            key={shortId.generate()}
            display={phoneNumber.display}
            phoneNumber={phoneNumber.phone}
            handleMakeCall={this.handleMakeCall}
          />
        ))}
      </div>
    );
  };

  renderClipboardItem = clipboardItem => {
    if (clipboardItem.text) {
      return <div>{clipboardItem.text}</div>;
    } else if (clipboardItem.image) {
      return (
        <img
          className={styles.clipboardImage}
          src={clipboardItem.image}
          alt=""
        />
      );
    }
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
                <div className={styles.clickToCall}>
                  Click to call:
                  {this.renderClickToCall(clipboardItem)}
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
