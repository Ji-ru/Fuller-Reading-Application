// React Dependencies
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';

// Styles 
import login from '../ui/LoginStyles';
import bubbles from '../ui/BubblesDesign';

// Controllers (Hooks)
import { useNavigationHelper } from '../Controller/NavigationController';
import { loginStudent } from '../Controller/AuthenticationController';
import { FirebaseError } from 'firebase/app';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle navigation for the next page (either sign-in or sign-up)
   * Used in Register Section () and Sign-in Section
   */
  const { handleNextStep } = useNavigationHelper();

  /**
   * Handle verification of users credential strored in the firebase authentication
   * Errors:
   * - if either email and password fields are not insterted, then it renders alert error message and ask to enter credentials again
   * - if password are not verified (therefore not stored in firebase auth), then it renders alert error message and ask to enter credentials again
   * @returns - proceed to enter the designated screen page based on user's role (Admin/Staff/Student)
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both emails and password.');
      return;
    }
    try {
      setLoading(true);

      await loginStudent(email, password);

      handleNextStep('Loading');

    } catch (error: any) {
      Alert.alert('Login Failed', 'Email and Password did not match: ' + error.message)
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <View style={login.container}>
        <Video
          style={login.video}
          source={require('../../assets/videos/cisc_logo_animated.mp4')}
          repeat={true}
        />
        {/* INPUT EMAIL CREDENTIAL */}
        <Text style={login.label}>Email Address</Text>
        <TextInput style={login.textinput} placeholder="example@gmail.com" value={email} onChangeText={setEmail} />

        {/* INPUT PASSWORD CREDENTIALS */}
        <Text style={login.label}>Password</Text>
        <TextInput
          style={login.textinput}
          secureTextEntry
          placeholder="**********"
          value={password} onChangeText={setPassword}
        />

        {/* FORGOT PASSWORD */}
        <Text style={login.forgotpass}>Forgot Password?</Text>

        {/* SIGN IN BUTTON */}
        <TouchableOpacity style={login.button} onPress={() => handleLogin()} disabled={loading}>
          {loading ?
            (<ActivityIndicator size={'small'} color={'#ffff'} />)
            :
            <Text style={login.buttonText}>Sign In</Text>
          }
        </TouchableOpacity>
      </View>

      {/* REGISTER SECTION */}
      <View style={login.notRegisteredContainer}>
        <View style={login.notRegisteredAlignment}>
          <View style={login.leftLine} />
          <Text style={login.notRegisteredText}>Not Registered Yet?</Text>
          <View style={login.rightLine} />
        </View>

        <View>
          {/* GOOGLE SIGN-IN METHOD */}
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

          {/* MANUAL ACCOUNT SIGN-UP METHOD */}
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
