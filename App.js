import React from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TabNavigator } from 'react-navigation';
import { Header } from 'react-native-elements';

import Home from './components/Home.js';
import Discover from './components/Discover.js';

const RootTabs = TabNavigator({
  Home: {
    screen: () => <Home />,
    navigationOptions: {
      title: "Home",
      tabBarIcon: <Icon name="home" color="black" />
    }
  },

  Discover: {
    screen: () => <Discover />,
    navigationOptions: {
      title: "DISCOVER",
      tabBarIcon: <Icon name="star" color="black" />
    }
  },

  Profile: {
    screen: () => <Home />,
    navigationOptions: {
      title: "PROFILE",
      tabBarIcon: <Icon name="face" color="black" />
    }
  }
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#1EE494',
  },
});

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          outerContainerStyles={{ position: 'relative', top: 0 }}
          innerContainerStyles={{ position: 'relative', top: 0 }}
          leftComponent={{ icon: 'menu', color: '#FFF' }}
          centerComponent={{ text: '', style: { fontSize: 16, color: '#FFF' } }}
          backgroundColor="#1EE494"
        />
        <RootTabs />
      </View>
    );
  }
}