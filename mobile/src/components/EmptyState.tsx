import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import PrimaryButton from './PrimaryButton';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ icon = '✨', title, description, actionLabel, onAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: { fontSize: 56, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: spacing.sm },
  description: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});

export default EmptyState;
