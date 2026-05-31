import React from 'react';
import { ScrollView, View, StyleSheet, StyleProp, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: readonly ('top' | 'bottom' | 'left' | 'right')[];
  scrollViewProps?: ScrollViewProps;
}

const ScreenContainer: React.FC<Props> = ({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  edges,
  scrollViewProps,
}) => {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, flexGrow: 1 },
});

export default ScreenContainer;
