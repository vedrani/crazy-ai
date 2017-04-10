'use strict';

const fs = require('fs-extra');
const plist = require('plist');
const infoPlistPath = './ios/ShoutemApp/Info.plist';
const infoPlistFile = fs.readFileSync(infoPlistPath, 'utf8');
const infoPlist = plist.parse(infoPlistFile);
const exec = require('child_process').execSync;

const rnCli = 'node node_modules/react-native/local-cli/cli.js link';

console.log('Adding camera and microphone permissions to Info.plist');
infoPlist['NSPhotoLibraryUsageDescription'] = 'App needs your camera to be able to scan QR codes';
infoPlist['NSCameraUsageDescription'] = 'App needs your camera to be able to scan QR codes';
infoPlist['NSMicrophoneUsageDescription'] = 'App needs your microphone to be able to scan QR codes';
fs.writeFileSync(infoPlistPath, plist.build(infoPlist));

exec(`${rnCli} react-native-camera`);
exec(`${rnCli} react-native-asset-resize-to-base64`);
