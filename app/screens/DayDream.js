import React, {
  Component
} from 'react';

import {
  Text,
} from 'react-native';

import {
  View,
  Screen,
  Row,
  Button,
} from '@shoutem/ui';

import {
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

export default class DayDream extends Component {
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

    this.state = { result: null };
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

    let result = [];
    for (var i=0;i<this.n;i++) {
      //setResult(i, topVal[i] * 100, labels[topInd[i]]);
      console.log('label:', i, topVal[i] * 100, this.labels[topInd[i]]);
      result = [
        ...result,
        {
          prob: topVal[i],
          label: this.labels[topInd[i]],
        },
      ];
    }
    this.setState({result});
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
      this.camera.capture().then((image) => {
        console.log('captured', image.path);
        const capturedUri = image.path;
        NativeModules.RNAssetResizeToBase64.assetToResizedBase64(
          capturedUri,
          224,
          224,
          (err, resizedData) => {
            console.log('is error resize', err); resizedData2="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";

            //const a = base64Arraybuffer.decode(resizedData);
            const binaryData = base64.decode(resizedData);
            var rawLength = binaryData.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for(i = 0; i < rawLength; i++) {
              array[i] = binaryData.charCodeAt(i);
            }
            //const decodedB64 = new Uint8Array([...binaryData]);
            var rawImageData = jpegJS.decode(array, true);

            this.classifyFromWebcam(rawImageData.data);
          }
        );
      });
    }
  }

  clearResults() {
    this.setState({
      result: null,
    })
  }

  render() {
    const { result } = this.state;

    return (
      <Screen>
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
        >
          <Button dark onPress={this.takePicture}>
            <Text>
              [CAPTURE]
            </Text>
          </Button>
        </Camera>
        {result &&
          <Button dark onPress={this.clearResults}>
            <Text>
              Clear results
            </Text>
          </Button>
        }
        {result && result.map(item => (
          <Row>
            <Text numberOfLines={1}>
              {item.label}
            </Text>
          </Row>
        ))}
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
});
