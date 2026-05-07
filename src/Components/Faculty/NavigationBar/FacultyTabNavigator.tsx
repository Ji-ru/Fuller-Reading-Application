
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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FacultyDashboard from '../../../Screens/Faculty/Faculty_Dashboard';
import FacultyProfile from '../../../Screens/Faculty/Faculty_Profile';
import MyClass from '../../../Screens/Faculty/Faculty_MyClass';
import MyArchive from '../../../Screens/Faculty/Faculty_MyArchive';
import { Icon, IconName } from '../../GlobalUse/Icon';

const Tab = createBottomTabNavigator();

const TAB_ICON: Record<string, IconName> = {
    FacultyDashboard: 'dashboard',
    MyClass:          'myclass',
    MyArchive:        'archive',
    FacultyProfile:   'profile',
};

const ACTIVE_COLOR   = '#008443';
const INACTIVE_COLOR = '#9CA3AF';

export default function FacultyTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    height: 68,
                    paddingBottom: 10,
                    paddingTop: 6,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor:   ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarLabelStyle: {
                    fontFamily: 'Nunito-Bold',
                    fontSize: 11,
                    marginTop: 2,
                },
                tabBarIcon: ({ focused }) => (
                    <Icon
                        name={TAB_ICON[route.name]}
                        size={24}
                        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
                        filled={focused}
                    />
                ),
            })}
        >
            <Tab.Screen name="FacultyDashboard" component={FacultyDashboard} options={{ title: 'Dashboard' }} />
            <Tab.Screen name="MyClass"          component={MyClass}          options={{ title: 'My Class' }} />
            <Tab.Screen name="MyArchive"        component={MyArchive}        options={{ title: 'Archive' }} />
            <Tab.Screen name="FacultyProfile"   component={FacultyProfile}   options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}
