import React, { PureComponent } from "react";
import socketIOClient from "socket.io-client";
import logo from "./logo.svg";
import "./App.css";

class App extends PureComponent {
  constructor(props) {
    super(props);

    const { ipcRenderer, clipboard } = this.props.electron;
    const socket = socketIOClient("http://localhost:8080");
    this.state = {
      socket,
      clipboard: clipboard.readText(),
    };

    ipcRenderer.on("clipboard", (event, arg) => {
      console.log("ipcRenderer clipboard event");
      this.setState({ clipboard: arg }, () => {
        const { socket, clipboard } = this.state;
        socket.emit("clipboard", { id: socket.id, clipboard });
      });
    });

    socket.on("connect", () => {
      console.log(`${socket.id} connected`);
    });

    socket.on("clipboard", ({ id, clipboard }) => {
      console.log(`clipboard "${clipboard}" received from ${id}`);
      this.setState({ clipboard }, () => {
        const { socket, clipboard } = this.state;
        console.log(`${socket.id} clipboard: ${clipboard}`);
      });
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    ipcRenderer.send(`ready`);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Clipboard Listener</h1>
        </header>
        <p className="App-intro">{this.state.clipboard}</p>
      </div>
    );
  }
}

export default App;
