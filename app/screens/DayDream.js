import React, {
  Component
} from 'react';

import { connect } from 'react-redux';

import { openInModal } from '@shoutem/core/navigation';
import { ext } from '../extension';

import {
  View,
  Screen,
  Row,
  Overlay,
  Image,
  TouchableOpacity,
  Button,
} from '@shoutem/ui';

import {
  Text,
  Dimensions,
  StyleSheet,
  NativeModules,
} from 'react-native';

import Camera from 'react-native-camera';

import jpegJS from 'jpeg-js';
import base64 from 'base-64';
import base64Arraybuffer from 'base64-arraybuffer';


//import NativeModules from 'NativeModules';

//onst caffe = require('../caffe.js');

class DayDream extends Component {
  constructor(props) {
    super(props);

    this.takePicture = this.takePicture.bind(this);
    this.clearResults = this.clearResults.bind(this);
    this.classifyFromWebcam = this.classifyFromWebcam.bind(this);
    this.classify = this.classify.bind(this);
    this.loadModel = this.loadModel.bind(this);

    this.nj = global.caffe.NumJS;
    this.image = new global.caffe.ImgJS.Image();

    // Image dimensions
    this.width = 224;
    this.height = 224;

    // Compare top-n labels
    this.n = 5;
    this.format = d3.format('.2%');

    // Let's hook up the webcam
    /*Webcam.set({
      width: width,
      height: heightß
    });
    Webcam.attach('.camera');*/

    this.labels = null;
    global.d3.text('https://chaosmail.github.io/caffejs/data/ilsvrc12/synset_words.txt', data =>
      this.labels = data.split('\n').map(function(d) {
        return d.substr(10);
      })
    );

    // the mean value can be found in train_val.prototxt
    this.mean = [104.0, 116.0, 122.0];

    this.loadModel();

    this.state = { results: null };
  }

  classifyFromWebcam(data) {
    const input = this.image.set({
      data,
      width: this.width,
      height: this.height,
    }).toVol(this.mean, [2,1,0]);

    this.classify(input);
  }

  classify(input) {
    console.log('Classify');
    var scores = this.model.forward(input);
    var topInd = this.nj.argmaxn(scores.w, this.n);
    var topVal = this.nj.maxn(scores.w, this.n);

    let results = [];
    for (var i=0;i<this.n;i++) {
      //setResult(i, topVal[i] * 100, labels[topInd[i]]);
      console.log('label:', i, topVal[i] * 100, this.labels[topInd[i]]);
      results= [
        ...results,
        {
          prob: topVal[i],
          label: this.labels[topInd[i]],
        },
      ];
    }

    this.setState({results});
    const route = {
      screen: ext('Results'),
      props: {
        results,
      },
    };
    this.props.openInModal(route);
  }

  loadModel() {
    this.model = new caffe.Net.CaffeModel(
      'https://raw.githubusercontent.com/chaosmail/caffejs/gh-pages/models/bvlc_googlenet/deploy.prototxt',
      'https://raw.githubusercontent.com/chaosmail/caffejs/gh-pages/models/bvlc_googlenet/weights/'
    );

    this.model.load();
  }

  takePicture() {
    console.log('Clicked');
    if (this.camera) {
      const options = {
        target: Camera.constants.CaptureTarget.temp,
      };
      this.camera.capture().then((image) => {
        console.log('captured', image.path);
        const capturedUri = image.path;
        NativeModules.RNAssetResizeToBase64.assetToResizedBase64(
          capturedUri,
          224,
          224,
          (err, resizedData) => {
            console.log('is error resize', err);

            const binaryData = base64.decode(resizedData);
            var rawLength = binaryData.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for(i = 0; i < rawLength; i++) {
              array[i] = binaryData.charCodeAt(i);
            }

            var rawImageData = jpegJS.decode(array, true);

            this.classifyFromWebcam(rawImageData.data);
          }
        );
      });
    }
  }

  clearResults() {
    this.setState({
      results: null,
    })
  }

  render() {
    const { results } = this.state;

    return (
      <Screen>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
        >
          <Overlay styleName="fill-parent" style={{backgroundColor: 'transparent', opacity: 1.0}}>
            <View styleName="fill-parent" style={{borderTopWidth: 120, borderBottomWidth: 120, borderColor: 'black', opacity: 0.4}}></View>
            <TouchableOpacity
              onPress={this.takePicture}
              style={{
                activeOpacity: 0.2,
                position: 'absolute',
                bottom: 30,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
              <Image
                styleName="small"
                source={require("../assets/brain-button.png")}
              />
            </TouchableOpacity>
          </Overlay>
        </Camera>
      </Screen>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'transparent',
  },
});

const mapDispatchToProps = {
  openInModal,
}

export default connect(null, mapDispatchToProps)(DayDream);
