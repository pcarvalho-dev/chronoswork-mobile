import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { 
  LoginScreen, 
  RegisterScreen, 
  ManagerRegisterScreen, 
  EmployeeRegisterScreen, 
  DashboardScreen,
  ManagerDashboardScreen,
  CompanyManagementScreen,
  InvitationsManagementScreen,
  EmployeesApprovalScreen
} from '../screens';
import { Loading } from '../components';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ManagerRegister: undefined;
  EmployeeRegister: undefined;
  Dashboard: undefined;
  ManagerDashboard: undefined;
  CompanyManagement: undefined;
  InvitationsManagement: undefined;
  EmployeesApproval: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
            <Stack.Screen name="CompanyManagement" component={CompanyManagementScreen} />
            <Stack.Screen name="InvitationsManagement" component={InvitationsManagementScreen} />
            <Stack.Screen name="EmployeesApproval" component={EmployeesApprovalScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ManagerRegister" component={ManagerRegisterScreen} />
            <Stack.Screen name="EmployeeRegister" component={EmployeeRegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
