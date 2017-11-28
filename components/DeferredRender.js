import React from 'react';
import { Image } from 'react-native';

class DeferredImage extends React.Component {
	setNativeProps = (nativeProps) => {
    this._root.setNativeProps(nativeProps);
  }
    constructor(props) {
      super(props);
  
      this.state = {
        value: '',
        done: false
      }
    }
  
    componentDidMount() {
      this.props.promise.then(value => {
        this.setState({
          value,
          done: true,
        });
      });
    }
  
    render() {
      const { value, done } = this.state;
  
      return !done
        ? this.props.then
        : <Image
            source={{ uri: this.state.value }}
            style={this.props.style}
          />
    }
  }

  export default DeferredImage;