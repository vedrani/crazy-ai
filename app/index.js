// Reference for app/index.js can be found here:
// http://shoutem.github.io/docs/extensions/reference/extension-exports

import * as extension from './extension.js';

export const screens = extension.screens;

var d3 = require("d3");
global.d3 = d3;
var caffe = require('./caffe.js');
global.caffe = caffe;
//const model = new caffe.Net.CaffeModel('https://raw.githubusercontent.com/BVLC/caffe/master/models/bvlc_googlenet/deploy.prototxt');

//model.load();//.then(function(d){
  //console.warn('Model loaded')
//}
