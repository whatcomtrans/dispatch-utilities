import React, { PureComponent } from "react";
import io from "socket.io-client";

const channelName = "A D1Comp";

class ClipboardHistory extends PureComponent {
  constructor(props) {
    super(props);

    const { ipcRenderer, clipboard } = this.props.electron;
    //const socket = socketIOClient("10.0.0.72:80?");
    const socket = io("http://localhost:8080/clipboard", {
      query: { channelName: encodeURIComponent(channelName) },
    });

    this.state = {
      clipboardHistory: [clipboard.readText()],
    };

    ipcRenderer.on("copy-text", (event, arg) => {
      socket.emit("copy-text", { clipboard: arg });
    });

    ipcRenderer.on("copy-image", (event, arg) => {
      socket.emit("copy-image", { clipboard: arg });
    });

    socket.on("connect", () => {
      console.log(`${channelName} connected`);
    });

    socket.on("clipboard", ({ channelNames, clipboardHistory }) => {
      console.log(`clipboard "${clipboard}" for ${channelNames}`);
      if (channelNames.includes(channelName)) {
        this.setState({ clipboardHistory }, () => {
          const { clipboardHistory } = this.state;
          console.log(`${socket.id} clipboard: ${clipboardHistory[0]}`);
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`${channelName} disconnected`);
    });

    ipcRenderer.send(`ready`);
  }

  handleCopy = x => {
    const { clipboard, nativeImage } = this.props.electron;
    if (x.type === "image") {
      //console.log("copy image", x.clipboard);
      clipboard.writeImage(nativeImage.createFromDataURL(x.clipboard));
    } else {
      clipboard.writeText(x.clipboard);
    }
  };

  render() {
    console.log("this.state.clipboardHistory", this.state.clipboardHistory);
    return (
      <div>
        {this.state.clipboardHistory.map((x, i) => (
          <p>
            {i === 0 ? "Currently on clipboard: " : `${i}. `}
            {x.type === "image" ? (
              <img src={x.clipboard} width="100" height="100" alt="" />
            ) : (
              x.clipboard
            )}
            {i !== 0 ? (
              <button
                style={{ cursor: "pointer" }}
                onClick={() => this.handleCopy(x)}
              >
                Copy
              </button>
            ) : null}
          </p>
        ))}
      </div>
    );
  }
}

export default ClipboardHistory;
