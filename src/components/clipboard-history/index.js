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

    ipcRenderer.on("copy", (event, arg) => {
      socket.emit("copy", { clipboard: arg });
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

  render() {
    console.log("this.state.clipboardHistory", this.state.clipboardHistory);
    return (
      <div>
        {this.state.clipboardHistory.map((x, i) => (
          <p>
            {i + 1}. {x}
          </p>
        ))}
      </div>
    );
  }
}

export default ClipboardHistory;
