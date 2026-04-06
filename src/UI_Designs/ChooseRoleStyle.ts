import { StyleSheet } from 'react-native';
import { sw, sh, sf } from '../Utils/responsive';

const chooseRole = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFBFF',
    padding: sw(10),
  },
  title: {
    fontFamily: 'DynaPuff-Bold',
    fontSize: sf(35),
    margin: sw(40),
    color: '#3B7FC9'
  },
  image: {
    width: sw(200),
    height: sw(220),
    maxWidth: sw(200),
    maxHeight: sw(220)
  },
  imageContainer: {
    alignItems: 'center',
  },


});

export default chooseRole;
