import React from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { colors, spacing } from '../theme';
import HomeScreen from '../screens/Home';
import GestureDetailScreen from '../screens/GestureDetail';
import FavoritesScreen from '../screens/Favorites';
import CreateGestureScreen from '../screens/CreateGesture';
import ProfileScreen from '../screens/Profile';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';

export type RootStackParamList = {
  Home: undefined;
  GestureDetail: { id: number };
  Favorites: undefined;
  CreateGesture: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderRight: React.FC<{ onPress: () => void; label: string }> = ({ onPress, label }) => (
  <Pressable onPress={onPress} style={{ paddingHorizontal: spacing.sm }}>
    <Text style={{ color: colors.accent, fontSize: 22 }}>{label}</Text>
  </Pressable>
);

const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'SignBridge',
              headerRight: () => (
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  <HeaderRight label="★" onPress={() => navigation.navigate('Favorites')} />
                  <HeaderRight label="＋" onPress={() => navigation.navigate('CreateGesture')} />
                  <HeaderRight label="👤" onPress={() => navigation.navigate('Profile')} />
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="GestureDetail"
            component={GestureDetailScreen}
            options={{ title: 'Жест' }}
          />
          <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Избранное' }} />
          <Stack.Screen
            name="CreateGesture"
            component={CreateGestureScreen}
            options={{ title: 'Новый жест' }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});

export default RootNavigator;
