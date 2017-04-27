import React, {
  Component
} from 'react';
import { connect } from 'react-redux';
import { openInModal } from '@shoutem/core/navigation';
import {
  View,
  Screen,
  Row,
  Overlay,
  Image,
  TouchableOpacity,
  Button,
  Spinner,
} from '@shoutem/ui';
import Camera from 'react-native-camera';
import { ext } from '../extension';
import Classifier from '../services/Classifier';

class ClassifierScreen extends Component {
  constructor(props) {
    super(props);

    this.handleCameraCaptureClick = this.handleCameraCaptureClick.bind(this);
    this.handleImageCaptured = this.handleImageCaptured.bind(this);
    this.showResults = this.showResults.bind(this);
    this.renderCameraOverlay = this.renderCameraOverlay.bind(this);

    this.classifier = new Classifier();

    this.state = {
      inProgress: false,
    };
  }

  handleCameraCaptureClick() {
    if (!this.camera) {
      return;
    }

    this.setState({
      inProgress: true,
    });

    // TODO: configure camera to save iamge to temp
    const options = {
      target: Camera.constants.CaptureTarget.temp,
    };
    this.camera.capture()
      .then(this.handleImageCaptured);
  }

  handleImageCaptured(image) {
    const { path } = image;

    this.classifier.process(path)
      .then((results) => {
        this.showResults(results);

        this.setState({
          inProgress: false,
        });
      });
  }

  showResults(results) {
    const route = {
      screen: ext('ResultsScreen'),
      props: {
        results,
      },
    };
    this.props.openInModal(route);
  }

  renderCameraOverlay() {
    const { inProgress } = this.state;

    return (
      <Overlay styleName="fill-parent" style={styles.overlay}>
        <View styleName="fill-parent" style={styles.cameraBorder} />
        <TouchableOpacity
          onPress={this.handleCameraCaptureClick}
          style={styles.cameraButton}
        >
          {!inProgress &&
            <Image
              styleName="small"
              source={require("../assets/brain-button.png")}
            />
          }
          {inProgress &&
            <Spinner style={{width: 65, height: 65, size:'large', color:'white'}}/>
          }
        </TouchableOpacity>
      </Overlay>
    )
  }

  render() {
    return (
      <Screen>
        <Camera
          ref={(cam) => { this.camera = cam; }}
          style={styles.camera}
        >
          {this.renderCameraOverlay()}
        </Camera>
      </Screen>
    );
  }
}

const styles = {
  camera: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'transparent',
    opacity: 1.0,
  },
  cameraBorder: {
    borderTopWidth: 120,
    borderBottomWidth: 120,
    borderColor: 'black',
    opacity: 0.4,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    activeOpacity: 0.2,
  },
};

const mapDispatchToProps = {
  openInModal,
}

export default connect(null, mapDispatchToProps)(ClassifierScreen);
