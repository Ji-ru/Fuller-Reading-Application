import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType } from 'react-native';
import UserHomeScreen from '../../../Screens/Student/Student_Home';
import PageSelectionScreen from '../../../Screens/Student/Student_Reading_Selection';
import StudentMyClass from '../../../Screens/Student/Student_MyClass';
import { withBackgroundMusic } from '../../GlobalUse/Background/Student_Bq_Music';

const Tab = createBottomTabNavigator();

// Each key matches the Tab.Screen `name` prop so the icon lookup works automatically.
const icons: Record<string, ImageSourcePropType> = {
    StudentHome: require('../../../../assets/icons/Dashboard-icon.png'),
    StudentLibrary: require('../../../../assets/icons/Book-icon.png'),
    StudentMyClass: require('../../../../assets/icons/Class-icon.png'),
};

// Wrap screens with withBackgroundMusic so music persists across tab switches.
const HomeWithMusic = withBackgroundMusic(UserHomeScreen);
const LibraryWithMusic = withBackgroundMusic(PageSelectionScreen);
const ClassWithMusic = withBackgroundMusic(StudentMyClass);

export default function StudentTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 5,
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#EDF1F7',
                },
                tabBarActiveTintColor: '#57b8b3',
                tabBarInactiveTintColor: '#8F9BB3',
                tabBarLabelStyle: {
                    fontFamily: 'Satoshi-Bold',
                    fontSize: 14,
                },
                tabBarIcon: ({ focused }) => (
                    <Image
                        source={icons[route.name]}
                        style={{
                            width: 30,
                            height: 30,
                            opacity: focused ? 1 : 0.6,
                        }}
                        resizeMode="contain"
                    />
                ),
            })}
        >
            <Tab.Screen name="StudentHome" component={HomeWithMusic} options={{ title: 'Home' }} />
            <Tab.Screen name="StudentLibrary" component={LibraryWithMusic} options={{ title: 'Library' }} />
            <Tab.Screen name="StudentMyClass" component={ClassWithMusic} options={{ title: 'My Classroom' }} />
        </Tab.Navigator>
    );
}
