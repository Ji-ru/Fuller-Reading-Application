// // src/Navigation/FacultyStack.tsx
// import React from 'react';
// import { View } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { RootStackParamList } from './src/Controller/NavigationController';
// import FacultyDashboard from './src/Screens/Faculty/FacultyDashboard';
// import FacultyProfile from './src/Screens/Faculty/FacultyProfile';
// import MyClass from './src/Screens/Faculty/MyClass';
// import MyStudents from './src/Screens/Faculty/MyStudents';
// import StudentViewProfile from './src/Screens/Faculty/StudentViewProfile';
// import BottomNav from './src/Components/NavigationBar/BottomNav';
// const Stack = createNativeStackNavigator<RootStackParamList>();

// const FacultyStack = () => {
//     const Stack = createNativeStackNavigator<RootStackParamList>();
  
//     const ScreenWithBottomNav = ({ children }: { children: React.ReactNode }) => (
//       <View style={{ flex: 1 }}>
//         {children}
//         <BottomNav />
//       </View>
//     );
  
//     return (
//       <Stack.Navigator initialRouteName="FacultyDashboard" screenOptions={{ headerShown: false }}>
//         <Stack.Screen
//           name="FacultyDashboard"
//           component={(props: any) => <ScreenWithBottomNav><FacultyDashboard {...props} /></ScreenWithBottomNav>}
//         />
//         <Stack.Screen
//           name="FacultyProfile"
//           component={(props: any) => <ScreenWithBottomNav><FacultyProfile {...props} /></ScreenWithBottomNav>}
//         />
//         <Stack.Screen
//           name="MyClass"
//           component={(props: any) => <ScreenWithBottomNav><MyClass {...props} /></ScreenWithBottomNav>}
//         />
//         <Stack.Screen name="MyStudents" component={MyStudents} />
//         <Stack.Screen name="StudentViewProfile" component={StudentViewProfile} />
//       </Stack.Navigator>
//     );
//   };
  

// export default FacultyStack;
