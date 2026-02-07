
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Image, ImageSourcePropType } from 'react-native';
// import FacultyDashboard from '../../../Screens/Faculty/Faculty_Dashboard';
// import FacultyProfile from '../../../Screens/Faculty/Faculty_Profile';
// import MyClass from '../../../Screens/Faculty/Faculty_MyClass';
// import MyArchive from '../../../Screens/Faculty/Faculty_MyArchive';

// const Tab = createBottomTabNavigator();

// export default function FacultyTabNavigator() {
//     const icons = {
//         FacultyDashboard: {
//             icon: require('../../../../assets/icons/Dashboard-icon.png'),
//         },
//         MyClass: {
//             icon: require('../../../../assets/icons/Class-icon.png'),
//         },
//         MyArchive: {
//             icon: require('../../../../assets/icons/Archive-icon.png'),
//         },
//         FacultyProfile: {
//             icon: require('../../../../assets/images/defaultProfile.png'),
//         },
//     };

//     const tabIcon = (icon: ImageSourcePropType) => {
//         return (
//             <Image
//                 source={icon}
//                 style={{ width: 22, height: 22 }}
//                 resizeMode="contain"
//             />
//         );
//     }

//     return (
//         <Tab.Navigator
//             screenOptions={{
//                 headerShown: false,
//                 tabBarStyle: {
//                     backgroundColor: '#FFFFFF',
//                     borderTopColor: '#EDF1F7',
//                 },
//                 tabBarActiveTintColor: '#3366FF',
//                 tabBarInactiveTintColor: '#8F9BB3',
//             }}
//         >
//             <Tab.Screen
//                 name="FacultyDashboard"
//                 component={FacultyDashboard}
//                 options={{
//                     title: 'Dashboard',
//                     tabBarIcon: () => tabIcon(icons.FacultyDashboard.icon)
//                 }}
//             />
//             <Tab.Screen
//                 name="MyClass"
//                 component={MyClass}
//                 options={{
//                     title: 'My Class',
//                     tabBarIcon: () => tabIcon(icons.MyClass.icon)
//                 }}
//             />
//             <Tab.Screen
//                 name="MyArchive"
//                 component={MyArchive}
//                 options={{
//                     title: 'Archive',
//                     tabBarIcon: () => tabIcon(icons.MyArchive.icon)
//                 }}
//             />
//             <Tab.Screen
//                 name="FacultyProfile"
//                 component={FacultyProfile}
//                 options={{
//                     title: 'Profile',
//                     tabBarIcon: () => tabIcon(icons.FacultyProfile.icon)
//                 }}
//             />
//         </Tab.Navigator>
//     );
// }

import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import FacultyDashboard from '../../../Screens/Faculty/Faculty_Dashboard';
import FacultyProfile from '../../../Screens/Faculty/Faculty_Profile';
import MyClass from '../../../Screens/Faculty/Faculty_MyClass';
import MyArchive from '../../../Screens/Faculty/Faculty_MyArchive';
import { useNavigationHelper } from '../../../Controller/NavigationController';
import { HeaderMenu } from '../../GlobalUse/HeaderMenu';

const Tab = createBottomTabNavigator();
const icons: Record<string, ImageSourcePropType> = {
    FacultyDashboard: require('../../../../assets/icons/Dashboard-icon.png'),
    MyClass: require('../../../../assets/icons/Class-icon.png'),
    MyArchive: require('../../../../assets/icons/Archive-icon.png'),
    FacultyProfile: require('../../../../assets/images/defaultProfile.png'),
};

export default function FacultyTabNavigator() {
    const { handleLogout } = useNavigationHelper();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                headerRight: () => (
                    <HeaderMenu onLogout={async () => await handleLogout()} />
                ),
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 5,
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#EDF1F7',
                },
                tabBarActiveTintColor: '#3366FF',
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
                            borderRadius: route.name === 'FacultyProfile' ? 11 : 0,
                            opacity: focused ? 1 : 0.6,
                        }}
                        resizeMode="contain"
                    />
                ),
            })}
        >
            <Tab.Screen name="FacultyDashboard" component={FacultyDashboard} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="MyClass" component={MyClass} options={{ title: 'My Class' }} />
            <Tab.Screen name="MyArchive" component={MyArchive} options={{ title: 'Archive' }} />
            <Tab.Screen name="FacultyProfile" component={FacultyProfile} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}
