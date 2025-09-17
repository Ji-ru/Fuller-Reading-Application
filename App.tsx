import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video from 'react-native-video';

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: 'Satoshi Variable' };

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: 'Satoshi Variable' };

function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        source={require('./assets/videos/cisc_logo_animated.mp4')}
        repeat={true}
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
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  video: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  label: {
    marginTop: 10,
    alignSelf: 'flex-start',
    marginStart: 45,
    marginBottom: 5,
    fontWeight: 'medium',
    fontSize: 15,
    fontFamily: 'Satoshi Variable',
  },
  textinput: {
    width: '100%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',

    // Shadows
    elevation: 5,

    // Dimension
    maxWidth: 290,
    maxHeight: 40,
  },
  button: {
    backgroundColor: '#2CA96A',
    borderRadius: 10,
    width: 240,
    height: 40,
    elevation: 5,
    alignItems: 'center',
    textAlign: 'center',
  },
  buttonText: {
    color: '#FFFF',
    fontSize: 15,
    fontWeight: 'black'
  },
});

export default App;
