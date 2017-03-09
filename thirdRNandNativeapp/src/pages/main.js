/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Platform,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Linking,
  Image
} from 'react-native';
import {
  isFirstTime,
  isRolledBack,
  packageVersion,
  currentVersion,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
} from 'react-native-update';
/*
  isFirstTime,              在每次更新完毕后的首次启动时，isFirstTime常量会为true
  isRolledBack,             通过isRolledBack来获知应用刚刚经历了一次回滚操作,如果上次回滚就返回true 
  packageVersion,           当前原生包的版本号
  currentVersion,           热更新下载下来的包的版本号
  checkUpdate,              检查服务器上是否有最新的热更新包，如果有的话会返回一个info对象
  downloadUpdate,           下载函数，传入info ；downloadUpdate 的返回值是一个hash字符串，它是当前版本的唯一标识。
  switchVersion,            你可以使用switchVersion函数立即切换版本(此时应用会立即重新加载)，或者选择调用 switchVersionLater，
                            让应用在下一次启动的时候再加载新的版本。
  switchVersionLater,
  markSuccess,              当应用新的包启动完成后， 你必须在应用退出前合适的任何时机，调用markSuccess，否则应用下一次启动的时候将会进行回滚操作

*/
import _updateConfig from '../../update.json';
const {appKey} = _updateConfig[Platform.OS];
import { connect } from 'react-redux';
import NavigatorBar from 'react-native-navbar';

import commonStyles from '../styles/common';

import { logOut } from '../actions/user';





import NativeToastAndroid from '../customnativecomponent/NativeToastAndroid';


class Main extends Component {

  constructor(props){
      super(props);

  }
  componentWillMount(){
    if (isFirstTime) {
      Alert.alert('提示', '这是当前版本第一次启动,是否要模拟启动失败?失败将回滚到上一版本', [
        {text: '是', onPress: ()=>{throw new Error('模拟启动失败,请重启应用')}},
        {text: '否', onPress: ()=>{markSuccess()}},
      ]);
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
  }
  doUpdate = info => {
    downloadUpdate(info).then(hash => {
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        {text: '是', onPress: ()=>{switchVersion(hash);}},
        {text: '否',},
        {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
      ]);
    }).catch(err => { 
      Alert.alert('提示', '更新失败.');
    });
  };
  checkUpdate = () => {
    checkUpdate(appKey).then(info => {
      if (info.expired) {
        Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
          {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
        ]);
      } else if (info.upToDate) {
        Alert.alert('提示', '您的应用版本已是最新.');
      } else {
        Alert.alert('提示', '检查到新的版本'+info.name+',是否下载?\n'+ info.description, [
          {text: '是', onPress: ()=>{this.doUpdate(info)}},
          {text: '否',},
        ]);
      }
    }).catch(err => { 
      Alert.alert('提示', '更新失败.');
    });
  };
  shouldComponentUpdate(nextProps, nextState){
      if(nextProps.isLoggedIn != this.props.isLoggedIn && nextProps.isLoggedIn === false){
          //logout, need to redirect login page
          this.toLogin();
          return false;
      }
      return true;
  }

  toLogin(){
      let {router} = this.props;
      router.resetToLogin();
  }

  _renderNavBar(){
      let {router, user, dispatch} = this.props;
      var leftButtonConfig = {
          title: 'Logout',
          handler: ()=>{
              dispatch(logOut());
          }
      };

      var titleConfig = {
          title: user.name || '',
      };
      return <NavigatorBar style={commonStyles.navbar}
                  title={titleConfig}
                  leftButton={leftButtonConfig}  />;
  }
  Toastfromnative(){
      NativeToastAndroid.show('这个Toast来自Android',NativeToastAndroid.SHORT);
  }
// 拿到从Native的数据传过来传给了base
  getData() {  
      NativeToastAndroid.dataToJS((msg) => {    
              let NativeData= msg;

              alert(msg);
          },  
          (result) => {  
              NativeToastAndroid.show('JS界面:错误信息为:' + result, NativeToastAndroid.SHORT);  
              alert(1);
          })  
  }  
  render() {
    {/*这里从是个图片链接，下面的Image组件会从网络请求这个图片加载*/}
    let pic = {
      uri: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1487593629108&di=effb5885950f07ad2ca82a588d3620e3&imgtype=0&src=http%3A%2F%2Fi2.sinaimg.cn%2Fgm%2F2014%2F0408%2FU1782P115DT20140408115114.jpg'
    };
    let {user} = this.props;
    return (
      <View style={[commonStyles.main, commonStyles.wrapper]}>
      {this._renderNavBar()}
      <View style={styles.container} >
      
        <Text onPress={this.Toastfromnative}>name: {user.name}</Text>
        <Text onPress={this.getData}>age: {user.age}</Text>
        
      </View>
      <View style={styles.container}>
        <Text style={styles.welcome}>
           下面这一坨是热更新服务相关
        </Text>
         <Image source={pic} style={{width: 193, height: 110,marginBottom : 50} } />
        <Text style={styles.instructions}>
          这是版本一 {'\n'}
          当前包版本号: {packageVersion}{'\n'}
          当前版本Hash: {currentVersion||'(空)'}{'\n'}
        </Text>
        <TouchableOpacity onPress={this.checkUpdate}>
          <Text style={styles.instructions}>
            点击这里检查更新
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      
      );

  }


  handlePress(){
    console.log('handlePress');

  }

  handleAsyncPress(){
    console.log('asyncPress');
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});


function select(store){
  return {
      isLoggedIn: store.userStore.isLoggedIn,
      user: store.userStore.user,
  }
}


export default connect(select)(Main);
