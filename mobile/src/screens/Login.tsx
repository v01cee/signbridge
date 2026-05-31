import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { login, fetchMe } from '../api/auth';
import { ApiError } from '../api/client';
import { useAuth } from '../store/auth';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Введите email и пароль');
      return;
    }
    setLoading(true);
    try {
      const token = await login(email.trim(), password);
      const user = await fetchMe(token);
      await setAuth(token, user);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else if (e instanceof Error) setError(e.message);
      else setError('Не удалось войти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Вход" />
      <View style={styles.card}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
        />
        <TextField
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Пароль"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Войти"
          onPress={onSubmit}
          loading={loading}
          style={styles.submit}
        />
      </View>

      <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>
          Нет аккаунта? <Text style={styles.linkAccent}>Зарегистрироваться</Text>
        </Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  submit: { marginTop: spacing.sm },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkAccent: { color: colors.accent, fontWeight: '600' },
});

export default LoginScreen;
