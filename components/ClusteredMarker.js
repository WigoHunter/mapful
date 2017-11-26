import React, { Component } from 'react';
import {Image, Text, View, ScrollView} from  'react-native';
import MapView from 'react-native-maps';
import { width as w , height as h } from 'react-native-dimension';

const height = h(100);
const width = w(100);
const Marker = () => (
    <View
      style={{
        width: 24,
        height: 24,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 0,
        backgroundColor: 'red',
        transform: [{ rotate: '45deg'}],
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#FFFFFF'
        }}
      >
      </View>
    </View>
  );
export default class CustomMarker extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLoaded:false,
            props: {},
            value: 0,
            clusterColor: '#F5F5F5',
            clusterTextColor: '#FF5252',
            clusterBorderColor: '#FF5252',
            clusterBorderWidth: 1,
			title:[]
        };
    }

    shouldComponentUpdate(nextProps, nextState){
        /* if(this.state.props.coordinate === nextProps.props.coordinate
         && this.state.value === nextProps.value){
             return(false);
         }else{
             return(true);
         }*/
        return(true);
    }
	dig(child, array){
		if(child.props.belly!=null){
			child.props.belly.forEach((childMarker)=>{
					array.push(childMarker.props.children.props.children.props.children);
					this.dig(childMarker,array);
			})
		}
		if(child.belly!=null){
			child.belly.forEach((childMarker)=>{
					array.push(childMarker.props.children.props.children.props.children);
					this.dig(childMarker,array);
			})
		}
	}
    render(){

        this.state.value = this.props.value;
        this.state.props = this.props.props;

        this.state.clusterColor = this.props.clusterColor;
        this.state.clusterTextColor = this.props.clusterTextColor;
        this.state.clusterBorderColor = this.props.clusterBorderColor;
        this.state.clusterBorderWidth = this.props.clusterBorderWidth;

        if( this.state.clusterColor === undefined || this.state.clusterColor == ''){
            this.state.clusterColor = '#F5F5F5';
        }if( this.state.clusterTextColor === undefined || this.state.clusterTextColor == ''){
            this.state.clusterTextColor = '#FF5252';
        }if( this.state.clusterBorderColor === undefined || this.state.clusterBorderColor == ''){
            this.state.clusterBorderColor = '#FF5252';
        }if( this.state.clusterBorderWidth === undefined || this.state.clusterBorderWidth == ''){
            this.state.clusterBorderWidth = 1;
        }

        let textForCluster = '';
        let markerWidth, markerHeight, textSize;
        let value = this.state.value;

        if(value>=2 && value<=10){
            textForCluster = value.toString();
            markerWidth = width*2/25;
            markerHeight = width*2/25;
            textSize = height/40;
        }if(value>10&&value<=25){
            textForCluster = '10+';
            markerWidth = width/7;
            markerHeight = width/7;
            textSize = height/40;
        }if(value>25&&value<=50){
            textForCluster = '25+';
            markerWidth = width*2/13;
            markerHeight = width*2/13;
            textSize = height/40;
        }if(value>50&&value<=100){
            textForCluster = '50+';
            markerWidth = width/6;
            markerHeight = width/6;
            textSize = height/38;
        }if(value>100){
            textForCluster = '100+';
            markerWidth = width*2/11;
            markerHeight = width*2/11;
            textSize = height/38;
        }

        let htmlElement;
        let isCluster;
		let arrayCallouts=[this.props.children.props.children.props.children];
		this.dig(this,arrayCallouts);
        if(textForCluster !== ''){
            isCluster = 1;
			textForCluster
            if(this.props.customClusterMarkerDesign && typeof this.props.customClusterMarkerDesign === "object"){
                htmlElement = (
                    <View style = {{width: markerWidth, height: markerHeight, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <Text style = {{width: markerWidth, textAlign: 'center',
                            fontSize: textSize, backgroundColor: 'transparent', color: this.state.clusterTextColor, fontWeight: 'bold', zIndex: 1 }}
                            children = {textForCluster}/>
                        {this.props.customClusterMarkerDesign}
                    </View>);
            }else{
                htmlElement = (
                    <View style = {{ borderRadius: markerWidth, position: 'relative', backgroundColor: this.state.clusterColor, width: markerWidth, height: markerHeight,
                        borderWidth: this.state.clusterBorderWidth, borderColor: this.state.clusterBorderColor, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <Text
                            style = {{width: markerWidth, textAlign: 'center',
                                fontSize: textSize, backgroundColor: 'transparent', color: this.state.clusterTextColor, fontWeight: 'bold', zIndex: 1 }}>
                            {textForCluster}
							</Text>
                    </View>);
            }
        }else{
            isCluster = 0;
            if(this.props.children !== undefined){
                htmlElement = this.props.children;
            }else{
                htmlElement = (null);
            }
        }
        if(isCluster === 1){
            if(this.props.onClusterPress){
                return(
                    <MapView.Marker
                        key = {isCluster}
                        {...this.state.props}
                        onPress = {()=>{
                            this.props.onClusterPress(this.state.props.coordinate);
                        }}
                        title={null}
                        >
                        {htmlElement}
                    </MapView.Marker>
                );
            }else{
                return(
                    <MapView.Marker
                        key = {isCluster}
                        {...this.state.props}
                        title={null}
                        style={{ zIndex: 1 }}
                        >
                        {htmlElement}
					  <MapView.Callout style={{ zIndex: 10 }}>
						<ScrollView style={{width: '100%',
						height: 320, zIndex: 10}}>
								{arrayCallouts}
						</ScrollView>
					  </MapView.Callout>
                    </MapView.Marker>
                );   
            }
        }else{
            return(
                <MapView.Marker
                    key = {isCluster}
                    style={{ zIndex: 1 }}                    
                    {...this.state.props}>
						<Marker />
						{htmlElement}
                </MapView.Marker>
            );
        }
    }
}
