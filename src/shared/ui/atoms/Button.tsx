import React from 'react';
import { TouchableOpacity, Text, View, StyleProp, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './Button.styles';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.buttonBase,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {/* 1. Liquid Glass Effect Border (Highlighter Layer) */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { padding: 1.5, borderRadius: 14 }]}
      >
        {/* 2. Main Background Layer (Primary: Specific Blue Gradient, Secondary: Glasswash Dark) */}
        {isPrimary ? (
          <LinearGradient
            colors={['rgba(141, 218, 255, 0.30)', 'rgba(80, 164, 255, 0.30)']}
            locations={[0.1184, 0.9259]}
            start={{ x: 0, y: 0.45 }}
            end={{ x: 1, y: 0.55 }}
            style={{ flex: 1,borderRadius: 14 }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              borderRadius: 14
            }}
          />
        )}
      </LinearGradient>

      {/* 3. Content Layer (Text and Icon) */}
      <View style={styles.content}>
        {icon && <View style={styles.iconSpacing}>{icon}</View>}
        <Text
          style={[
            isPrimary ? styles.primaryText : styles.secondaryText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};