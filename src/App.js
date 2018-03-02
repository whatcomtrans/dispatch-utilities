import React, { PureComponent } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends PureComponent {
  constructor(props) {
    super(props);

    const { ipcRenderer, clipboard } = this.props.electron;
    this.state = {
      clipboard: clipboard.readText(),
    };

    ipcRenderer.on("clipboard", (event, arg) => {
      this.setState({ clipboard: arg });
    });
    ipcRenderer.send("ready");
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
