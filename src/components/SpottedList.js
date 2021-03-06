import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  FlatList,
  RefreshControl,
  Text
} from 'react-native';
import { Button, Icon, View, Spinner } from 'native-base';
import SpottedCard from '../components/SpottedCard';
import ProgressBar from '../components/ProgressBar';
import { Actions } from 'react-native-router-flux';
import { FloatingAction } from 'react-native-floating-action';
import LZString from 'lz-string';

export default class SpottedList extends Component {
  
  constructor(props) {
    super(props);
    this._listViewOffset = 0
    this.state = {
      color: props.color,
      subcolor: props.subcolor,
      spotteds: props.dataPosts,
      isLoading: true,
      isActionButtonVisible: true,
      refreshing: false
    }
  }

  renderLoader = () => {
   return (
      this.state.showLoader ? <View><Spinner color={this.state.color} /></View> : null
    );
  };

  addButton = () => {
    return (
     <View style={styles.view}>
        <Button transparent button onPress={this.addPost}>
          <Icon type="MaterialCommunityIcons" name="plus" style={{ fontSize: 25, color: this.state.color }} />
        </Button>
      </View>
    );
  };

  async componentDidMount() {
    let request = [];
    let posts = [];
    try {
      await fetch('https://api-spotted.herokuapp.com/api/spotted/visible')
        .then(res => res.json())
        .then(data => {
          request = data;
          posts = request;
          //request.forEach(spotted => {
          //  if (spotted.visible) {
          //    posts.push(spotted);
          //  }
          //});
          //posts.map(item => {
          //  item.image = LZString.decompress(item.image);
          //}).sort((a, b) => b.id - a.id);
          posts.sort((a,b) => b.id - a.id);
          this.setState({ isLoading: false, spotteds: posts });
        });
    } catch (error) {}
  };

  _onScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y
    const direction = (currentOffset > 0 && currentOffset > this._listViewOffset)
      ? 'down'
      : 'up'
    const isActionButtonVisible = direction === 'up'
    if (isActionButtonVisible !== this.state.isActionButtonVisible) {
      this.setState({ isActionButtonVisible: isActionButtonVisible })
    }
    this._listViewOffset = currentOffset
  }
  

  addPost = () => {
    Actions.jump('addspotted');
  };

  handleRefresh = async () => {
    this.setState({ isLoading: true });
    await this.componentDidMount();
  };

  renderEmptyData() {
    return (
      <View style={{ alignItems: 'center', marginTop: 25 }}>
        <Text style={{ fontSize: 18, fontFamily: 'ProductSans' }}>{'\n\n\n\n\nDesculpe, \nmas não temos nada aqui :(\n\n\nAproveite e adicione um novo!'}</Text>
      </View>
    );
  }

  render() {
    return (
      this.state.isLoading ? <ProgressBar color={this.state.color} /> :
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.spotteds}
          renderItem={(item) => {
            return (
              <SpottedCard 
                data={item}
                color={this.state.color}
                subcolor={this.state.subcolor}
                renderWithComments={false}
              />
            )}
          }
          keyExtractor={item => item.id + ''}
          onEndReachedThreshold={1}
          onScroll={this._onScroll}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              colors={[this.state.color]}
            />
          }
          ListFooterComponent={this.renderLoader}
          ListEmptyComponent={this.renderEmptyData}
        />
         <FloatingAction
            color={this.state.color}
            floatingIcon={<Icon type="MaterialCommunityIcons"style={{color: '#fff'}} name="plus"/>}
            position="right"
            visible={this.state.isActionButtonVisible}
            showBackground={false}
            onPressMain={this.addPost}
            overlayColor="#F2F2F2"
            distanceToEdge={16}
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 0,
    backgroundColor: '#fff',
    height: 40,
    elevation: 5,
  }
});
