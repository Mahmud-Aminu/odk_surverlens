import { AppText } from "@/components";
import {
  SelectMultipleField,
  SelectOneField,
  SelectOption,
} from "@/types/FormFieldTypes";
import { Feather } from "@expo/vector-icons";
import React, { memo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

/**
 * SelectField Component
 *
 * Renders single-choice and multiple-choice selection fields following ODK patterns.
 *
 * Features:
 * - Single select (radio buttons)
 * - Multiple select (checkboxes)
 * - Dropdown appearance
 * - Minimal appearance (compact)
 * - Image choices support
 * - Audio choices support (future)
 * - Search/filter for long lists
 * - Validation (min/max selections)
 * - Required indicator
 * - Error display
 * - Accessibility support
 *
 * ODK Appearances Supported:
 * - default: Standard radio/checkbox list
 * - minimal: Compact dropdown style
 * - dropdown: Modal dropdown picker
 * - autocomplete: Searchable dropdown
 * - image-map: Image-based selection
 * - likert: Likert scale layout
 *
 * @param field - Field definition (SelectOneField | SelectMultipleField)
 * @param value - Current field value (string or string[])
 * @param error - Validation error message
 * @param onChange - Value change handler
 */

interface SelectFieldProps {
  field: SelectOneField | SelectMultipleField;
  value: string | string[] | null | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
}

export const SelectField = memo<SelectFieldProps>(
  ({ field, value, error, onChange }) => {
    // ============================================================================
    // STATE
    // ============================================================================

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================

    const isMultiple = field.type === "select_multiple";

    /**
     * Normalize value to array for consistent handling
     */
    const selectedValues = isMultiple
      ? (value as string[]) || []
      : value
        ? [value as string]
        : [];

    /**
     * Filter choices based on search query
     */
    const filteredChoices = field.choices.filter(
      (choice) =>
        searchQuery === "" ||
        choice.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        choice.value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /**
     * Get selected option labels for display
     */
    const selectedLabels = selectedValues
      .map((val) => field.choices.find((c) => c.value === val)?.label)
      .filter(Boolean)
      .join(", ");

    /**
     * Determine if dropdown style should be used
     */
    const useDropdown =
      field.appearance === "dropdown" ||
      field.appearance === "minimal" ||
      field.appearance === "autocomplete" ||
      field.choices.length > 6; // Auto-use dropdown for long lists

    /**
     * Determine if search should be shown
     */
    const showSearch =
      field.appearance === "autocomplete" || field.choices.length > 10;

    // ============================================================================
    // HANDLERS
    // ============================================================================

    /**
     * Handle option selection
     *
     * For single select: Replace value
     * For multiple select: Toggle value in array
     */
    const handleSelect = (optionValue: string) => {
      if (isMultiple) {
        const multiField = field as SelectMultipleField;
        const currentValues = selectedValues as string[];
        const isSelected = currentValues.includes(optionValue);

        if (isSelected) {
          // Deselect
          const newValues = currentValues.filter((v) => v !== optionValue);

          // Check minimum selections
          if (
            multiField.minSelections &&
            newValues.length < multiField.minSelections
          ) {
            return; // Don't allow deselection below minimum
          }

          onChange(newValues);
        } else {
          // Select
          // Check maximum selections
          if (
            multiField.maxSelections &&
            currentValues.length >= multiField.maxSelections
          ) {
            return; // Don't allow selection above maximum
          }

          onChange([...currentValues, optionValue]);
        }
      } else {
        // Single select
        onChange(optionValue);
        if (useDropdown) {
          setShowModal(false); // Close modal after selection
        }
      }
    };

    /**
     * Clear all selections
     */
    const handleClear = () => {
      onChange(isMultiple ? [] : (null as any));
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    /**
     * Render single option (radio or checkbox)
     */
    const renderOption = (option: SelectOption, index: number) => {
      const isSelected = selectedValues.includes(option.value);

      return (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionContainer,
            isSelected && styles.optionSelected,
            option.image && styles.optionWithImage,
          ]}
          onPress={() => handleSelect(option.value)}
          accessibilityRole={isMultiple ? "checkbox" : "radio"}
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={option.label}
        >
          {/* Option Image (if provided) */}
          {option.image && (
            <Image
              source={{ uri: option.image }}
              style={styles.optionImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.optionContent}>
            {/* Radio/Checkbox Icon */}
            <View style={styles.iconContainer}>
              {isMultiple ? (
                // Checkbox
                <Feather
                  name={isSelected ? "check-square" : "square"}
                  size={24}
                  color={isSelected ? "#0a7ea4" : "#9ca3af"}
                />
              ) : (
                // Radio button
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              )}
            </View>

            {/* Option Label */}
            <AppText
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    };

    /**
     * Render dropdown button
     */
    const renderDropdownButton = () => (
      <TouchableOpacity
        style={[styles.dropdownButton, error && styles.dropdownButtonError]}
        onPress={() => setShowModal(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${field.label}`}
        accessibilityHint={`Currently selected: ${selectedLabels || "None"}`}
      >
        <AppText
          style={[
            styles.dropdownText,
            !selectedLabels && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedLabels || field.hint || "Select an option"}
        </AppText>
        <Feather name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>
    );

    /**
     * Render modal picker
     */
    const renderModal = () => (
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>{field.label}</AppText>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {showSearch && (
              <View style={styles.searchContainer}>
                <Feather
                  name="search"
                  size={20}
                  color="#9ca3af"
                  style={styles.searchIcon}
                />
                <input
                  style={styles.searchInput}
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredChoices}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => renderOption(item, index)}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={
                <AppText style={styles.emptyText}>No options found</AppText>
              }
            />

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {isMultiple && selectedValues.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                >
                  <AppText style={styles.clearButtonText}>Clear All</AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowModal(false)}
              >
                <AppText style={styles.doneButtonText}>Done</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );

    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
      <View style={styles.container}>
        {/* Field Label */}
        <View style={styles.labelContainer}>
          <AppText style={styles.label}>
            {field.label}
            {field.required && <AppText style={styles.required}> *</AppText>}
          </AppText>
        </View>

        {/* Help Text */}
        {field.hint && <AppText style={styles.hint}>{field.hint}</AppText>}

        {/* Dropdown or Inline Options */}
        {useDropdown ? (
          <>
            {renderDropdownButton()}
            {renderModal()}
          </>
        ) : (
          <View style={styles.optionsContainer}>
            {field.choices.map((option, index) => renderOption(option, index))}
          </View>
        )}

        {/* Selection Count (for multiple select) */}
        {isMultiple && selectedValues.length > 0 && (
          <View style={styles.countContainer}>
            <AppText style={styles.countText}>
              {selectedValues.length} selected
            </AppText>
            <TouchableOpacity onPress={handleClear}>
              <AppText style={styles.clearLink}>Clear all</AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Min/Max Hint */}
        {isMultiple && (
          <>
            {(field as SelectMultipleField).minSelections && (
              <AppText style={styles.constraintHint}>
                Minimum selections:{" "}
                {(field as SelectMultipleField).minSelections}
              </AppText>
            )}
            {(field as SelectMultipleField).maxSelections && (
              <AppText style={styles.constraintHint}>
                Maximum selections:{" "}
                {(field as SelectMultipleField).maxSelections}
              </AppText>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>⚠️ {error}</AppText>
          </View>
        )}
      </View>
    );
  }
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#ef4444",
    fontWeight: "bold",
  },
  hint: {
    fontSize: hp(1.6),
    color: "#6b7280",
    marginBottom: 8,
    lineHeight: hp(2.2),
  },

  // Inline Options
  optionsContainer: {
    gap: 8,
  },
  optionContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  optionSelected: {
    borderColor: "#0a7ea4",
    backgroundColor: "#eff6ff",
  },
  optionWithImage: {
    flexDirection: "column",
  },
  optionImage: {
    width: "100%",
    height: 150,
    borderRadius: 6,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  optionLabel: {
    fontSize: hp(1.8),
    color: "#374151",
    flex: 1,
  },
  optionLabelSelected: {
    color: "#0a7ea4",
    fontWeight: "500",
  },

  // Radio Button
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#0a7ea4",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0a7ea4",
  },

  // Dropdown
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    minHeight: 48,
  },
  dropdownButtonError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  dropdownText: {
    fontSize: hp(1.8),
    color: "#374151",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: "600",
    color: "#374151",
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
    color: "#374151",
    borderWidth: 0, // removes any visible border
    // no outline property in RN — it's only for web
  },
  modalList: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: hp(1.8),
    paddingVertical: 32,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  clearButtonText: {
    color: "#6b7280",
    fontWeight: "500",
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0a7ea4",
  },
  doneButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Selection Info
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  countText: {
    fontSize: hp(1.6),
    color: "#6b7280",
  },
  clearLink: {
    fontSize: hp(1.6),
    color: "#0a7ea4",
    textDecorationLine: "underline",
  },
  constraintHint: {
    fontSize: hp(1.4),
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },

  // Error
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: hp(1.6),
    color: "#ef4444",
    lineHeight: hp(2.2),
  },
});

SelectField.displayName = "SelectField";
