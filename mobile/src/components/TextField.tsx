import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface Props extends TextInputProps {
  label?: string;
  errorText?: string | null;
  containerStyle?: StyleProp<ViewStyle>;
}

const TextField: React.FC<Props> = ({ label, errorText, containerStyle, style, ...rest }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={[styles.input, !!errorText && styles.inputError, style]}
      />
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: { borderColor: colors.error },
  error: { color: colors.error, fontSize: 12, marginTop: spacing.xs },
});

export default TextField;
