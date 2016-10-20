/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  PanResponder,
  DeviceEventEmitter,
  ToastAndroid
} from 'react-native';

var mSensorManager = require('NativeModules').SensorManager;

import LinearGradient from 'react-native-linear-gradient';


import colr from './colr';
import normalize from './normalize';
import clamp from './clamp';

import HuePicker, { HUE_SIZE } from './HuePicker';

let window = Dimensions.get('window');

let PICKER_SIZE = 100;

export default class ColorPicker extends Component {

  constructor(props){
    super(props)

    this.state = {
      x: 0,
      y: 0,
      hue: 0,
      sat: 0,
      val: 100
    }
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.setColor(gestureState.x0, gestureState.y0);
      },
      onPanResponderMove: (evt, gestureState) => {
        this.setColor(gestureState.moveX, gestureState.moveY);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
    });

    
  }


  componentDidMount(){
    mSensorManager.startAccelerometer(100); // To start the accelerometer with a minimum delay of 100ms between events.
    DeviceEventEmitter.addListener('Accelerometer', function (data) {
      /**
      * data.x
      * data.y
      * data.z
      **/

      // ToastAndroid.show(''+data.x+' '+data.y+' '+data.z,ToastAndroid.SHORT);
    });
  }

  componentWillUnmount(){
    mSensorManager.stopAccelerometer();
  }


  setColor(touchX, touchY) {
    let maxWidth = window.width-PICKER_SIZE;
    let maxHeight = window.height-HUE_SIZE-PICKER_SIZE;
    
    let x = clamp(touchX - (PICKER_SIZE/2), 0, maxWidth);
    let y = clamp(touchY - (PICKER_SIZE/2), 0, maxHeight);

    let normalX = normalize(x, maxWidth)*100;
    let normalY = 100-(normalize(y, maxHeight)*100);

    this.setState({ x, y, sat: normalX, val: normalY });
  }

  setHue = (hue) => {
    this.setState({hue: hue });
  }

  render() {
    let color = colr.fromHsv(this.state.hue, this.state.sat, this.state.val);
    let luminosity = color.toGrayscale();

    let pickerStyle = {
      top: this.state.y,
      left: this.state.x,
      borderColor: (luminosity <= 128) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
      backgroundColor: color.toHex(),
    };

    let colorStyle = {
      backgroundColor: colr.fromHsv(this.state.hue, 100, 100).toHex(),
    };

    return (
      <View style={styles.container}>
        <View style={[styles.color, colorStyle]} {...this._panResponder.panHandlers}>
          
          <View
            style={[styles.picker, pickerStyle]}
          />
        </View>
        <HuePicker
          hue={this.state.hue}
          onChange={this.setHue}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  color: {
    flex: 1,
  },
  image: {
    width: window.width,
    height: window.height - HUE_SIZE,
  },
  picker: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: PICKER_SIZE,
    height: PICKER_SIZE,
    borderRadius: PICKER_SIZE/2,
    borderWidth: 1,
    backgroundColor: 'transparent',
  }
});

AppRegistry.registerComponent('ColorPicker', () => ColorPicker);
