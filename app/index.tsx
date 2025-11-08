import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ODKFormApp = () => {
  const [view, setView] = useState("forms");
  const [availableForms, setAvailableForms] = useState([
    {
      id: "form1",
      name: "Patient Registration",
      version: "1.0",
      downloaded: false,
      fields: [
        { id: "name", label: "Full Name", type: "text", required: true },
        { id: "age", label: "Age", type: "number", required: true },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female", "Other"],
          required: true,
        },
        { id: "address", label: "Address", type: "textarea", required: false },
        { id: "phone", label: "Phone Number", type: "tel", required: true },
      ],
    },
    {
      id: "form2",
      name: "Survey Questionnaire",
      version: "1.2",
      downloaded: false,
      fields: [
        {
          id: "respondent",
          label: "Respondent Name",
          type: "text",
          required: true,
        },
        { id: "date", label: "Survey Date", type: "date", required: true },
        {
          id: "satisfaction",
          label: "Satisfaction Level",
          type: "select",
          options: [
            "Very Satisfied",
            "Satisfied",
            "Neutral",
            "Dissatisfied",
            "Very Dissatisfied",
          ],
          required: true,
        },
        {
          id: "feedback",
          label: "Additional Feedback",
          type: "textarea",
          required: false,
        },
      ],
    },
    {
      id: "form3",
      name: "Field Inspection",
      version: "2.0",
      downloaded: false,
      fields: [
        {
          id: "inspector",
          label: "Inspector Name",
          type: "text",
          required: true,
        },
        { id: "location", label: "Location", type: "text", required: true },
        {
          id: "inspection_date",
          label: "Inspection Date",
          type: "date",
          required: true,
        },
        {
          id: "status",
          label: "Status",
          type: "select",
          options: ["Pass", "Fail", "Needs Review"],
          required: true,
        },
        {
          id: "notes",
          label: "Inspection Notes",
          type: "textarea",
          required: false,
        },
        {
          id: "follow_up",
          label: "Follow-up Required",
          type: "checkbox",
          required: false,
        },
      ],
    },
  ]);

  const [submissions, setSubmissions] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingSubmission, setEditingSubmission] = useState(null);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = async () => {
    try {
      const formsData = await AsyncStorage.getItem("odk_forms");
      const submissionsData = await AsyncStorage.getItem("odk_submissions");

      if (formsData) {
        setAvailableForms(JSON.parse(formsData));
      }
      if (submissionsData) {
        setSubmissions(JSON.parse(submissionsData));
      }
    } catch (error) {
      console.log("No existing data or error loading:", error);
    }
  };

  const saveToStorage = async (forms, subs) => {
    try {
      await AsyncStorage.setItem("odk_forms", JSON.stringify(forms));
      await AsyncStorage.setItem("odk_submissions", JSON.stringify(subs));
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  };

  const downloadForm = (formId) => {
    const updatedForms = availableForms.map((f) =>
      f.id === formId ? { ...f, downloaded: true } : f
    );
    setAvailableForms(updatedForms);
    saveToStorage(updatedForms, submissions);
  };

  const startNewSubmission = (form) => {
    setCurrentForm(form);
    setFormData({});
    setEditingSubmission(null);
    setView("fill");
  };

  const editSubmission = (submission) => {
    const form = availableForms.find((f) => f.id === submission.formId);
    setCurrentForm(form);
    setFormData(submission.data);
    setEditingSubmission(submission);
    setView("fill");
  };

  const handleInputChange = (fieldId, value) => {
    const updatedData = { ...formData, [fieldId]: value };
    setFormData(updatedData);
  };

  const saveSubmission = (status) => {
    const submission = {
      id: editingSubmission ? editingSubmission.id : `sub_${Date.now()}`,
      formId: currentForm.id,
      formName: currentForm.name,
      data: formData,
      status: status,
      createdAt: editingSubmission
        ? editingSubmission.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedSubmissions;
    if (editingSubmission) {
      updatedSubmissions = submissions.map((s) =>
        s.id === editingSubmission.id ? submission : s
      );
    } else {
      updatedSubmissions = [...submissions, submission];
    }

    setSubmissions(updatedSubmissions);
    saveToStorage(availableForms, updatedSubmissions);
    setView("submissions");
    setCurrentForm(null);
    setFormData({});
    setEditingSubmission(null);
  };

  const deleteSubmission = (submissionId) => {
    Alert.alert(
      "Delete Submission",
      "Are you sure you want to delete this submission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedSubmissions = submissions.filter(
              (s) => s.id !== submissionId
            );
            setSubmissions(updatedSubmissions);
            saveToStorage(availableForms, updatedSubmissions);
          },
        },
      ]
    );
  };

  const renderField = (field) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
      case "tel":
      case "date":
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder={`Enter ${field.label}`}
            placeholderTextColor="#999"
          />
        );
      case "number":
        return (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder={`Enter ${field.label}`}
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        );
      case "textarea":
        return (
          <TextInput
            style={[styles.input, styles.textarea]}
            value={value}
            onChangeText={(text) => handleInputChange(field.id, text)}
            placeholder={`Enter ${field.label}`}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        );
      case "select":
        return (
          <View style={styles.selectContainer}>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.selectOption,
                  value === option && styles.selectOptionActive,
                ]}
                onPress={() => handleInputChange(field.id, option)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    value === option && styles.selectOptionTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case "checkbox":
        return (
          <View style={styles.checkboxContainer}>
            <Switch
              value={value === true}
              onValueChange={(checked) => handleInputChange(field.id, checked)}
              trackColor={{ false: "#767577", true: "#4F46E5" }}
              thumbColor={value ? "#fff" : "#f4f3f4"}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const renderFormsView = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Available Forms</Text>
      {availableForms.map((form) => (
        <View key={form.id} style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{form.name}</Text>
              <Text style={styles.cardSubtitle}>Version {form.version}</Text>
              <Text style={styles.cardInfo}>{form.fields.length} fields</Text>
            </View>
            <View style={styles.cardRight}>
              {!form.downloaded ? (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadForm(form.id)}
                >
                  <Ionicons name="download-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Download</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <View style={styles.downloadedBadge}>
                    <Text style={styles.downloadedText}>Downloaded</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.fillButton}
                    onPress={() => startNewSubmission(form)}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.buttonText}>Fill Form</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderFillView = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            {editingSubmission ? "Edit Submission" : "New Submission"}
          </Text>
          <Text style={styles.subtitle}>{currentForm.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setView("submissions");
            setCurrentForm(null);
            setFormData({});
            setEditingSubmission(null);
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        {currentForm.fields.map((field) => (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            {renderField(field)}
          </View>
        ))}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={() => saveSubmission("draft")}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save as Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finalizeButton}
            onPress={() => saveSubmission("finalized")}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Finalize</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSubmissionsView = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Submissions</Text>
      {submissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            No submissions yet. Fill out a form to get started.
          </Text>
        </View>
      ) : (
        submissions.map((submission) => (
          <View key={submission.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{submission.formName}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status: </Text>
                  <Text
                    style={[
                      styles.statusValue,
                      submission.status === "finalized"
                        ? styles.statusFinalized
                        : styles.statusDraft,
                    ]}
                  >
                    {submission.status.charAt(0).toUpperCase() +
                      submission.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  Last updated:{" "}
                  {new Date(submission.updatedAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.cardActions}>
                {submission.status === "draft" && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editSubmission(submission)}
                  >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteSubmission(submission.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>ODK Form Manager</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, view === "forms" && styles.tabActive]}
          onPress={() => setView("forms")}
        >
          <Text
            style={[styles.tabText, view === "forms" && styles.tabTextActive]}
          >
            Forms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === "submissions" && styles.tabActive]}
          onPress={() => setView("submissions")}
        >
          <Text
            style={[
              styles.tabText,
              view === "submissions" && styles.tabTextActive,
            ]}
          >
            Submissions ({submissions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {view === "forms" && renderFormsView()}
      {view === "submissions" && renderSubmissionsView()}
      {view === "fill" && renderFillView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  navbar: {
    backgroundColor: "#2563eb",
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#2563eb",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: "#4b5563",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  downloadedBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  downloadedText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  fillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  selectOptionActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  selectOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  draftButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d97706",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  finalizeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusFinalized: {
    color: "#059669",
  },
  statusDraft: {
    color: "#d97706",
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },
});

export default ODKFormApp;

// import { AppContainer, AppText } from "@/components";
// import { Feather } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useEffect } from "react";
// import { heightPercentageToDP as hp } from "react-native-responsive-screen";

// const Index = () => {
//   const route = useRouter();
//   useEffect(() => {
//     setTimeout(() => {
//       route.replace("/(tabs)");
//     }, 3000);
//   }, []);
//   return (
//     <AppContainer className="h-screen-safe flex justify-center items-center">
//       <Feather name="file-text" size={hp(15)} color={"#ffff"} />
//       <AppText>KTeHealthCollect</AppText>
//     </AppContainer>
//   );
// };

// export default Index;
