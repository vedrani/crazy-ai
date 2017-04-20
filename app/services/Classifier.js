import { NativeModules } from 'react-native';
import jpegJS from 'jpeg-js';
import base64 from 'base-64';
const d3 = require('d3');
const caffe = require('../lib/caffe.js');

const { NumJS, ImgJS, Net } = caffe;

export default class Classifier {
  constructor() {
    this.classify = this.classify.bind(this);
    this.process = this.process.bind(this);
    this.resizeImage = this.resizeImage.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.loadLabels = this.loadLabels.bind(this);

    // Image dimensions
    this.width = 224;
    this.height = 224;

    // Compare top-n labels
    this.numOfLabels = 5;

    // the mean value can be found in train_val.prototxt
    this.mean = [104.0, 116.0, 122.0];

    this.loadModel();
    this.loadLabels();
  }

  loadModel() {
    this.model = new Net.CaffeModel(
      'https://raw.githubusercontent.com/chaosmail/caffejs/gh-pages/models/bvlc_googlenet/deploy.prototxt',
      'https://raw.githubusercontent.com/chaosmail/caffejs/gh-pages/models/bvlc_googlenet/weights/'
    );

    this.model.load();
  }

  loadLabels() {
    this.labels = null;
    d3.text('https://chaosmail.github.io/caffejs/data/ilsvrc12/synset_words.txt', data =>
      this.labels = data
        .split('\n')
        .map(dataItem => dataItem.substr(10))
    );
  }

  process(imageUri) {
    return this.resizeImage(imageUri)
      .then((resizedImageData) => {
        return this.classify(resizedImageData);
      });
  }

  classify(imageData) {
    console.log('Classify');

    const image = new ImgJS.Image();
    const input = image
      .set({
        data: imageData,
        width: this.width,
        height: this.height,
      })
      .toVol(this.mean, [2,1,0]);

    var scores = this.model.forward(input);
    var topInd = NumJS.argmaxn(scores.w, this.numOfLabels);
    var topVal = NumJS.maxn(scores.w, this.numOfLabels);

    let results = [];
    for (var i=0; i<this.numOfLabels; i++) {
      console.log('label:', i, topVal[i] * 100, this.labels[topInd[i]]);
      results= [
        ...results,
        {
          prob: topVal[i],
          label: this.labels[topInd[i]],
        },
      ];
    }

    return results;
  }

  resizeImage(imageUri) {
    const promise = new Promise(function(resolve, reject) {
      NativeModules.RNAssetResizeToBase64.assetToResizedBase64(
        imageUri,
        this.width,
        this.height,
        (err, resizedImageData) => {
          if (err) {
            reject(err);
          }

          const binaryImageData = base64.decode(resizedImageData);

          var rawLength = binaryImageData.length;
          var array = new Uint8Array(new ArrayBuffer(rawLength));
          for(i = 0; i < rawLength; i++) {
            array[i] = binaryImageData.charCodeAt(i);
          }

          var rawImage = jpegJS.decode(array, true);
          resolve(rawImage.data);
        }
      );
    });

    return promise;
  }
}
