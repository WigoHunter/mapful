import React from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, ScrollView, Text, TextInput, Image, RefreshControl, TouchableHighlight } from 'react-native';
import { Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LazyloadScrollView, LazyloadImage } from 'react-native-lazyload';
import db from './utils/db.js';
import { mapIdToProfilePicture } from './utils/utils.js';
import DeferredImage from './DeferredRender.js';
import Profile from './Profile.js'
import Icon2 from 'react-native-vector-icons/MaterialIcons';


export default class UserList extends React.Component {
	
	constructor(props) {
    super(props);

    this.state = {
      pins: [],
      refreshing: false,
	  goToProfile: ''
    };
  }
  
  
  render() {
	return (
		<View style={{flex:1}}>
			<View style={{ 
					  position: 'absolute',
					  zIndex: 100,
					  top: 0,
					  left: 0
					}}>
					<TouchableOpacity>
						<Icon2 name="arrow-back" color="black" size={30} onPress= {()=>this.props.back()}/>
					</TouchableOpacity>				
			  </View>
			{this.state.goToProfile!=''&&
			  <View style={{
			  position: 'absolute',
			  zIndex: 1000,
			  backgroundColor:'white',
			  height: '100%',
			  width: '100%'
			  }}>
			<Profile screenProps={{user: this.state.goToProfile,userData:this.state.profileData,back:()=>{
				this.setState({goToProfile:''})}
					, guest:this.props.user
					
					, callback:()=>{
						db.collection('User')
								  .find({ username: this.state.goToProfile})
								  .then(docs => {(
								  console.log(docs[0]),
								this.setState({
								profileData:docs[0].profile}))});
								this.props.callback()}
								}}/>
			</View>
			}
			<Text style={{
				height: 30,
				marginLeft: '5%',
				marginTop: '5%',
				fontSize: 25,
				fontWeight: 'bold',
				alignSelf: 'stretch',
				backgroundColor: '#FFF',
				}}>
				{this.props.title}</Text>
				<LazyloadScrollView
					style={{
						flex: 1,
						flexDirection: 'column',
						backgroundColor: '#EFEFEF',
					  }}
					name="lazyload-scrollview">
						{this.props.list.map(name => (
						  <ListItem
							key={name}
							name={name}
							host="lazyload-scrollview"
							user={this.props.user}
							goToProfile={(user)=>{
								db.collection('User')
								  .find({ username: user})
								  .then(docs => {(
								  console.log(docs[0]),
								this.setState({
								profileData:docs[0].profile,goToProfile:user}))})
							}}
						  />
						))}
			</LazyloadScrollView>
		</View>	
	)
  }
}

class ListItem extends React.Component {
	
  constructor(props) {
    super(props);
	db.collection('User')
            .find({ username: this.props.name })
            .then(users => {
                let user = users[0];
				this.setState({intro:user.profile.intro})
			})
  }
  render() {
    return (
      <View style={{
		  flex : 1,
		 backgroundColor: '#FFF',
		flexDirection: 'row',
		alignSelf: 'stretch',
		margin: 5,
		borderRadius: 6,
		padding: 8,}}>
		 <TouchableOpacity
				  onPress= {()=>this.props.goToProfile(this.props.name)}>
                <DeferredImage
                  promise={mapIdToProfilePicture(this.props.name)}
                  then={<View style={{ width: 100, height: 100 }} />}
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 30,
                    marginRight: 6
                  }}
                />
                </TouchableOpacity>	
				<View style={{ flex : 1,flexDirection: 'column',marginLeft:10}}>
					<Text style = {{
						fontSize: 18,
						fontWeight: 'bold',
						alignSelf: 'stretch',}}
						onPress= {()=>this.props.goToProfile(this.props.name)}
						>
						{this.props.name}
					</Text>
					<Text style = {{
						fontSize: 14,
						fontWeight: 'normal',
						alignSelf: 'stretch',}}>
						{this.state==null? "":this.state.intro}
					</Text>
				</View>
	  </View>
	  )
  }
}