import AppTextInput from '@/components/common/AppTextInput';
import { useTheme } from '@/theme/ThemeContext';
import { FormField as IFormField, SelectMultipleField, SelectOneField, TextField } from '@/types/FormFieldTypes';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FormFieldProps {
  field: IFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  readOnly?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error, readOnly }) => {
  const [showPicker, setShowPicker] = useState(false);
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  if (field.type === 'note') {
    return (
      <View className="my-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
        <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">{field.label}</Text>
      </View>
    );
  }

  const renderInput = () => {
    switch (field.type) {
      case 'text':
        const textField = field as TextField;
        return (
          <AppTextInput
            value={value || ''}
            onChangeText={onChange}
            placeholder="Type answer..."
            editable={!readOnly}
            multiline={textField.inputType === 'multiline'}
            error={error}
          />
        );
      case 'integer':
        return (
          <AppTextInput
            value={value ? String(value) : ''}
            onChangeText={(text) => onChange(text === '' ? null : parseInt(text, 10))}
            placeholder="0"
            keyboardType="numeric"
            editable={!readOnly}
            error={error}
          />
        );
      case 'date':
        // Use native date picker from @react-native-community/datetimepicker
        const initialDate = value ? new Date(String(value)) : new Date();

        const onDateChange = (_event: any, selected?: Date) => {
          setShowPicker(false);
          if (selected) {
            // Store as YYYY-MM-DD string for compatibility with form definitions
            const iso = selected.toISOString();
            const dateStr = iso.split('T')[0];
            onChange(dateStr);
          }
        };

        return (
          <View className="mb-4">
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 rounded-xl border ${error ? 'border-red-500' : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
              onPress={() => setShowPicker(true)}
              disabled={readOnly}
              activeOpacity={0.7}
            >
              <Text className={`text-base ${value ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                {value ? String(value) : 'YYYY-MM-DD'}
              </Text>
              <Feather name="calendar" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={initialDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            {error && (
              <Text className="mt-1 text-sm text-red-500 ml-1">
                {error}
              </Text>
            )}
          </View>
        );
      case 'select_one':
        const selectOneField = field as SelectOneField;
        return (
          <View className="mt-2 gap-3">
            {selectOneField.choices.map((choice) => (
              <TouchableOpacity
                key={choice.value}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${value === choice.value
                    ? 'bg-blue-50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500'
                    : `border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-800' : 'bg-white'}`
                  }`}
                onPress={() => onChange(choice.value)}
                disabled={readOnly}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-medium ${value === choice.value
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                    }`}
                >
                  {choice.label}
                </Text>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${value === choice.value
                      ? 'border-blue-600 dark:border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                  {value === choice.value && (
                    <View className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {error && (
              <Text className="mt-1 text-sm text-red-500 ml-1">
                {error}
              </Text>
            )}
          </View>
        );
      case 'select_multiple':
        const selectMultipleField = field as SelectMultipleField;
        const currentValues = Array.isArray(value) ? value : [];
        return (
          <View className="mt-2 gap-3">
            {selectMultipleField.choices.map((choice) => {
              const isSelected = currentValues.includes(choice.value);
              return (
                <TouchableOpacity
                  key={choice.value}
                  className={`flex-row items-center justify-between p-4 rounded-xl border ${isSelected
                      ? 'bg-blue-50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500'
                      : `border-gray-200 dark:border-gray-700 ${isDark ? 'bg-gray-800' : 'bg-white'}`
                    }`}
                  onPress={() => {
                    if (isSelected) {
                      onChange(currentValues.filter((v: any) => v !== choice.value));
                    } else {
                      onChange([...currentValues, choice.value]);
                    }
                  }}
                  disabled={readOnly}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-medium ${isSelected
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {choice.label}
                  </Text>
                  <View
                    className={`w-6 h-6 rounded border-2 items-center justify-center ${isSelected
                        ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    {isSelected && <Feather name="check" size={14} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
            {error && (
              <Text className="mt-1 text-sm text-red-500 ml-1">
                {error}
              </Text>
            )}
          </View>
        );
      default:
        return <Text className="text-red-500">Unsupported field type: {field.type}</Text>;
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
        {field.label}
        {field.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {field.hint && <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">{field.hint}</Text>}
      {renderInput()}
    </View>
  );
};

export default FormField;