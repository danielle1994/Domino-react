import React, { Component } from "react";
import theme from "./theme.css";

const leftPad = (width, n) => {
    if ((n + '').length > width) {
        return n;
    }
    const padding = new Array(width).join('0');
    return (padding + n).slice(-width);
  };
  
class Timer extends React.Component {
  constructor(props) {
    super(props);
    
    ["update", "reset"].forEach((method) => {
        this[method] = this[method].bind(this);
    });

    this.state = this.initialState = {
      timeElapsed: 0,
    };
  }

  componentDidMount() {
      this.startTimer();
  }
  
  reset() {
    clearInterval(this.timer);
    this.setState(this.initialState);
    this.startTimer();
  }

  startTimer() {
    this.startTime = Date.now();
    this.timer = setInterval(this.update, 1000);
  }

  stop() {
    clearInterval(this.timer);
  }
  
  update() {
    const delta = Date.now() - this.startTime;
    this.setState({timeElapsed: this.state.timeElapsed + delta});
    this.startTime = Date.now();
  }

  render() {
    const {timeElapsed} = this.state;
    if(this.props.isGameOver) 
    {
      this.stop();
    }
    return (
      <div>
        <TimeElapsed id="timer" timeElapsed={timeElapsed} />
      </div>
    );
  }
}

class TimeElapsed extends React.Component {
  getUnits() {
    const seconds = this.props.timeElapsed / 1000;
    return {
      min: Math.floor(seconds / 60).toString(),
      sec: Math.floor(seconds % 60).toString(),
    };
  }
  
  render() {
    const units = this.getUnits();
    return (
      <div id={this.props.id}>
        <span>{leftPad(2, units.min)}:</span>
        <span>{leftPad(2, units.sec)}</span>
      </div>
    );
  }
}


export default Timer;

