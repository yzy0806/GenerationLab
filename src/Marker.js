import React, { Component } from 'react';

export default class Marker extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (<div style={ marker }></div>)
  }
}

const marker = {
  width: 10,
  height:10,
  background: 'red'
};
