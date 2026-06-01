import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { PlannerHomeScreen } from '../screens/planner/PlannerHomeScreen';
import { ChoosePlannerTypeScreen } from '../screens/planner/ChoosePlannerTypeScreen';
import { CustomPlannerSetupScreen } from '../screens/planner/CustomPlannerSetupScreen';
import { AIPlannerSetupScreen } from '../screens/planner/AIPlannerSetupScreen';
import { AIPlannerResultsScreen } from '../screens/planner/AIPlannerResultsScreen';
import { PlannedOutfitDetailsScreen } from '../screens/planner/PlannedOutfitDetailsScreen';

const Stack = createNativeStackNavigator();

export const PlannerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlannerHome" component={PlannerHomeScreen} />
      <Stack.Screen name="ChoosePlannerType" component={ChoosePlannerTypeScreen} />
      <Stack.Screen name="CustomPlannerSetup" component={CustomPlannerSetupScreen} />
      <Stack.Screen name="AIPlannerSetup" component={AIPlannerSetupScreen} />
      <Stack.Screen name="AIPlannerResults" component={AIPlannerResultsScreen} />
      <Stack.Screen name="PlannedOutfitDetails" component={PlannedOutfitDetailsScreen} />
    </Stack.Navigator>
  );
};
