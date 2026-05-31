import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import Header from '../components/Header';
import TextField from '../components/TextField';
import PrimaryButton from '../components/PrimaryButton';
import { register, login, fetchMe } from '../api/auth';
import { ApiError } from '../api/client';
import { useAuth } from '../store/auth';
import { colors, radius, spacing } from '../theme';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const e = email.trim();
    const u = username.trim();
    if (!e || !u || !password) {
      setError('Заполните все поля');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    setLoading(true);
    try {
      await register(e, u, password);
      const token = await login(e, password);
      const user = await fetchMe(token);
      await setAuth(token, user);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title="Регистрация" />
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
          label="Имя пользователя"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="username"
        />
        <TextField
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Минимум 6 символов"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Зарегистрироваться"
          onPress={onSubmit}
          loading={loading}
          style={styles.submit}
        />
      </View>

      <Pressable onPress={() => navigation.navigate('Login')} style={styles.link}>
        <Text style={styles.linkText}>
          Уже есть аккаунт? <Text style={styles.linkAccent}>Войти</Text>
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

export default RegisterScreen;
