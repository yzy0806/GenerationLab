import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Marker from './Marker';
import _ from 'lodash';

/*
 * Use this component as a launching-pad to build your functionality.
 *
 */

const apiKey = 'AIzaSyA5ba29IyViT1Oui93AOwx3c_0dUXjh_Jo';

export default class YourComponent extends Component {

  constructor(props) {
    super(props);
    this.state = { selectedItem: [], stores: [] };
    this.removeElement = this.removeElement.bind(this);
  }

  _onChildClick = (key) => {
    const storeName = this.state.stores[key];
    if (!_.includes(this.state.selectedItem, storeName)) {
      let selectedArray = this.state.selectedItem;
      selectedArray.push(storeName);
      this.setState( {selectedItem: selectedArray });
    }
  }

  removeElement (name) {
    const selectedArray = _.remove(this.state.selectedItem, (item) => {return item.Name !== name});
    this.setState( {selectedItem: selectedArray });
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
      _.each(data, (store, index) => {
        const geoCodingString = `https://maps.googleapis.com/maps/api/geocode/json?address=${store.Address}&key=${apiKey}`
        // Delay each request for 10 milliseconds to avoid Google API limit
        _.delay(()=>promises.push(fetch(geoCodingString)), index*10);
      });
      _.delay(() => {
        // Wait for all promises has been fulfilled
        Promise.all(promises).then(values => {
          let secondaryPromises = [];
          for (let val of values) {
            secondaryPromises.push(val.json());
          }
          Promise.all(secondaryPromises).then(vals => {
            for (let i =0; i<data.length; i++) {
              // update the store directory with location information
              _.assign(data[i], { Location:vals[i] });
            };
            // Use only responses have valid location information from google map API
            this.setState({stores: _.filter(data, (datum) => {return datum.Location.status === 'OK'})});
          });
        })
      },data.length*11)
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
            <div>
              <li key={index}>{JSON.stringify(item.Name)}</li>
              <p onClick={() => this.removeElement(item.Name)}>REMOVE</p>
            </div>

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