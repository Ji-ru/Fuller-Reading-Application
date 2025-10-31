import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import login from '../ui/LoginStyles';
import { useNavigationHelper } from '../Functions/Buttons';
// import bubbles from '../ui/BubblesDesign';

export default function LoginScreen() {

  const {handleNextStep, handleBackStep} = useNavigationHelper();
  // Go to Loading Screen after Login
  // const handleLogin = () => {
  //   navigation.replace('Loading');
  // };

  // const handleNotRegistered = () => {
  //   navigation.navigate('SignUpOne');
  // };

  return (
    <SafeAreaProvider>
      <View style={login.container}>
        <Video
          style={login.video}
          source={require('../../assets/videos/cisc_logo_animated.mp4')}
        />
        <Text style={login.label}>Email Address</Text>
        <TextInput style={login.textinput} placeholder="example@gmail.com" />
        <Text style={login.label}>Password</Text>
        <TextInput
          style={login.textinput}
          secureTextEntry
          placeholder="**********"
        />
        <Text style={login.forgotpass}>Forgot Password?</Text>
        <TouchableOpacity style={login.button} onPress={() => handleNextStep('UserHome')}>
          <Text style={login.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      {/* NOT REGISTERED YET SECTION */}
      <View style={login.notRegisteredContainer}>
        <View style={login.notRegisteredAlignment}>
          <View style={login.leftLine} />
          <Text style={login.notRegisteredText}>Not Registered Yet?</Text>
          <View style={login.rightLine} />
        </View>
        <View>
          <TouchableOpacity
            style={login.signupwithgooglebutton}
            onPress={() => handleNextStep('SignUpOne')}
            activeOpacity={0.7}
          >
            <Image
              style={login.googleimage}
              source={require('../../assets/images/Google-icon.png')}
            />
            <Text style={login.registerText}>Sign Up with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={login.signupwithemailbutton}
            onPress={() => handleNextStep('SignUpOne')}
            activeOpacity={0.7}
          >
            <Text style={login.registerText}>Sign Up with Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
