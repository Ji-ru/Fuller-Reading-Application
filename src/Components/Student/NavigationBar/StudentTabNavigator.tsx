import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType } from 'react-native';
import UserHomeScreen from '../../../Screens/Student/Student_Home';
import PageSelectionScreen from '../../../Screens/Student/Student_Reading_Selection';
import StudentMyClass from '../../../Screens/Student/Student_MyClass';
import { withBackgroundMusic } from '../../GlobalUse/Background/Student_Bq_Music';
import Profile from '../../../Screens/Student/Student_Profile';
import React, { useState, useEffect } from 'react';
import { getCurrentUserSex } from '../../../Controller/AuthenticationController';
const Tab = createBottomTabNavigator();

// Each key matches the Tab.Screen `name` prop so the icon lookup works automatically.
const icons: Record<string, ImageSourcePropType> = {
    StudentHome: require('../../../../assets/icons/HomeUser-icon.png'),
    StudentLibrary: require('../../../../assets/icons/LibraryUser-icon.png'),
    StudentMyClass: require('../../../../assets/icons/ClassUser-icon.png'),
};

// Gender-based profile icons
const profileIcons = {
    male: require('../../../../assets/icons/Male-icon.png'),
    female: require('../../../../assets/icons/Female-icon.png'),
    default: require('../../../../assets/images/defaultProfile.png'),
};


// Wrap screens with withBackgroundMusic so music persists across tab switches.
const HomeWithMusic = withBackgroundMusic(UserHomeScreen);
const LibraryWithMusic = withBackgroundMusic(PageSelectionScreen);
const ClassWithMusic = withBackgroundMusic(StudentMyClass);
const ProfileWithMusic = withBackgroundMusic(Profile);

export default function StudentTabNavigator() {
    const [profileIcon, setProfileIcon] = useState<ImageSourcePropType>(profileIcons.default);
    useEffect(() => {
        const loadProfileIcon = async () => {
            const sex = await getCurrentUserSex();
            console.log("Sex: " + sex);
            const normalized = sex?.toLowerCase();
            if (normalized === 'male') setProfileIcon(profileIcons.male);
            else if (normalized === 'female') setProfileIcon(profileIcons.female);
            else setProfileIcon(profileIcons.default);
        };
        loadProfileIcon();
    }, []);

    const getTabIcon = (routeName: string): ImageSourcePropType => {
        if (routeName === 'Profile') return profileIcon;
        return icons[routeName];
    };
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
                tabBarActiveTintColor: '#6db4ff',
                tabBarInactiveTintColor: '#8F9BB3',
                tabBarLabelStyle: {
                    fontFamily: 'DynaPuff-Bold',
                    fontSize: 12,
                    marginTop: 5
                },
                tabBarIcon: ({ focused }) => (
                    <Image
                        source={getTabIcon(route.name)}
                        style={{
                            width: 40,
                            height: 40,
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
            <Tab.Screen name="Profile" component={Profile} options={{ title: 'My Profile' }} />

        </Tab.Navigator>
    );
}
