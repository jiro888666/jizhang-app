import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const colors = useColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.expense
              : isFocused
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={colors.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.expense }]}>{error}</Text>
      )}
    </View>
  );
}

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  type: 'income' | 'expense';
  currency?: string;
}

export function AmountInput({ value, onChangeValue, type, currency = 'CNY' }: AmountInputProps) {
  const colors = useColors();
  const symbols: Record<string, string> = { CNY: '¥', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || '¥';
  const bgColor = type === 'income' ? colors.incomeLight : colors.expenseLight;

  return (
    <View style={[styles.amountContainer, { backgroundColor: bgColor }]}>
      <Text style={[styles.currencySymbol, { color: colors.text }]}>
        {symbol}
      </Text>
      <TextInput
        style={[styles.amountInput, { color: colors.text }]}
        value={value}
        onChangeText={onChangeValue}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={colors.muted}
        selectTextOnFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 20,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    minWidth: 150,
    textAlign: 'center',
  },
});