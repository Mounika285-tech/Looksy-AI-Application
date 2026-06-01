import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';

// Onboarding Screens
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { IntroScreen1 } from '../screens/onboarding/IntroScreen1';
import { IntroScreen2 } from '../screens/onboarding/IntroScreen2';
import { IntroScreen3 } from '../screens/onboarding/IntroScreen3';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { SignUpScreen } from '../screens/onboarding/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/onboarding/ForgotPasswordScreen';

// Personalization Screens
import { ProfileSetupScreen } from '../screens/personalization/ProfileSetupScreen';
import { StylePreferenceScreen } from '../screens/personalization/StylePreferenceScreen';
import { SetupCompleteScreen } from '../screens/personalization/SetupCompleteScreen';

// Home Bottom Tab Navigator
import { HomeTabNavigator } from './HomeTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying session..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Intro1" component={IntroScreen1} />
          <Stack.Screen name="Intro2" component={IntroScreen2} />
          <Stack.Screen name="Intro3" component={IntroScreen3} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : !profile?.setupCompleted ? (
        <>
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="StylePreference" component={StylePreferenceScreen} />
          <Stack.Screen name="SetupComplete" component={SetupCompleteScreen} />
        </>
      ) : (
        <Stack.Screen name="HomeTabs" component={HomeTabNavigator} />
      )}
    </Stack.Navigator>
  );
};
