import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker';
import _ from 'lodash';

/*
 * Use this component as a launching-pad to build your functionality.
 *
 */

const apiKey = 'AIzaSyCRHD4PvyN3T9Z8y6GRpk6diLILMcMpTDE';

export default class YourComponent extends Component {

  constructor(props) {
    super(props);
    this.state = { selectedItem: [], stores: [] };
  }

  _onChildClick = (key) => {
    const storeName = this.state.stores[key];
    if (!_.includes(this.state.selectedItem, storeName)) {
      let selectedArray = this.state.selectedItem;
      selectedArray.push(storeName);
      this.setState( {selectedItem: selectedArray });
    }
  }


  static get defaultProps() {
    return {
        center: {lat: 19.38, lng: -99.20},
        zoom: 11
    }
  }
  componentDidMount() {
    let promises = [];
    fetch('../store_directory.json')
    .then((res) => res.json())
    .then((data) => {
      _.each(data, (store) => {
        const geoCodingString = `https://maps.googleapis.com/maps/api/geocode/json?address=${store.Address}&key=${apiKey}`
        promises.push(fetch(geoCodingString));
      });
      Promise.all(promises).then(values => {
        let secondaryPromises = [];
        for (let val of values) {
          secondaryPromises.push(val.json());
        }
        Promise.all(secondaryPromises).then(vals => {
          for (let i =0; i<data.length; i++) {
              _.assign(data[i], { Location:vals[i] });
            };
          this.setState({stores: _.filter(data, (datum) => {return datum.Location.status === 'OK'})});
          });
        })
        }
      );
   }

  render() {
    return (
      <div style={divStyle}>
        <h1> Put your solution here!</h1>
        <div style={mapStyle}>
          <GoogleMapReact
            bootstrapURLKeys={{
              key: apiKey
            }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            onChildClick={this._onChildClick}>
            {this.state.stores.map((store, index) => (
              <Marker
                key = {index}
                lat={store.Location.results[0].geometry.location.lat}
                lng={store.Location.results[0].geometry.location.lng}
                text={store.Name}
              />
            ))
            }
          </GoogleMapReact>
        </div>
        <div style={list}>
          List of selected stores
          <ul>
            { this.state.selectedItem.map( (item, index) =>(
                <li key={index}>{JSON.stringify(item.Name)}</li>
              ))
            }
          </ul>
        </div>
      </div>
    );
  }
}

var divStyle = {
  border: 'red',
  borderWidth: 2,
  borderStyle: 'solid',
  padding: 20,
  height: 700
};

const mapStyle = {
  width: '70%',
  height: 600,
  float: 'left'
};

const list ={
  padding: '1%',
  float: 'right'
}