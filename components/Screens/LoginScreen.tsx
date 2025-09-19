import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import styles from '../ui/LoginStyles';

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: 'Satoshi Variable' };

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: 'Satoshi Variable' };

export default function LoginScreen({ navigation }: any) {
  // Go to Loading Screen after Login
  const handleLogin = () => {
    navigation.replace('Loading');
  };

  const handleNotRegistered = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Video
          style={styles.video}
          source={require('../../assets/videos/cisc_logo_animated.mp4')}
          repeat
          resizeMode="cover"
        />
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.textinput} placeholder="juan@gmail.com" />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.textinput}
          secureTextEntry
          placeholder="**********"
        />
        <Text style={styles.forgotpass}>Forgot Password?</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      {/* NOT REGISTERED YET SECTION */}
      <View style={styles.notRegisteredContainer}>
        <View style={styles.notRegisteredAlignment}>
          <View style={styles.leftLine} />
          <Text style={styles.notRegisteredText}>Not Registered Yet?</Text>
          <View style={styles.rightLine} />
        </View>
        <View>
          <TouchableOpacity
            style={styles.signupwithgooglebutton}
            onPress={handleNotRegistered}
            activeOpacity={0.7}
          >
            <Image
              style={styles.googleimage}
              source={require('../../assets/images/Google-icon.png')}
            />
            <Text>Sign Up with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupwithemailbutton}
            onPress={handleNotRegistered}
            activeOpacity={0.7}
          >
            <Text>Sign Up with Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

