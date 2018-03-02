import React, { Component } from "react";
const electron = window.electron;
const { ipcRenderer, clipboard } = electron;

function withClipboardListener(Component, callback) {
  return class extends Component {
    constructor(props) {
      super(props);

      this.state = { data = clipboard.readText() }
      ipcRenderer.on("clipboard", this.handleClipboardEvent);
      ipcRenderer.send("ready");
    }

    handleClipboardEvent = (event, data) => {
      this.setState({ data });
    };

    componentWillUnmount() {
      ipcRenderer.removeListener("clipboard", this.handleClipboardEvent);
    }

    render() {
      return <Component clipboardData={this.state.data} {...this.props} />;
    }
  };
}
