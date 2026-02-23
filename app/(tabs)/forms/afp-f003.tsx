import {
  AppButton,
  AppCard,
  AppContainer,
  AppText,
  AppTextInput,
} from "@/components";
import { sendWeeklyReport } from "@/services/SubmissionService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function AFPWeeklyReportScreen() {
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    health_facility: (params.health_facility as string) || "",
    reporting_week: (params.reporting_week as string) || "",
    year: (params.year as string) || "",
    afp_cases_reported: Number(params.count) || 0,
    focal_person_name: "",
    focal_person_phone: "",
    report_date: new Date().toISOString().split("T")[0],
  });

  // Fetch focal person data from AsyncStorage on mount
  useEffect(() => {
    const loadFocalPerson = async () => {
      try {
        const data = await AsyncStorage.getItem("@surveilPro_focal_person");
        if (data) {
          const parsed = JSON.parse(data);
          setForm((prev) => ({
            ...prev,
            focal_person_name: parsed.name || parsed.focal_person_name || "",
            focal_person_phone: parsed.phone || parsed.focal_person_phone || "",
          }));
        }
      } catch (err) {
        console.warn("Failed to load focal person data:", err);
      }
    };
    loadFocalPerson();
  }, []);

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Submitting AFP Weekly Report:", form);
      // TODO: send to backend / firestore here
      await sendWeeklyReport(form, "afp");
      // await addDoc(collection(db, "afp_weekly_reports"), form);
      router.back();
    } catch (err) {
      console.warn("Failed to submit", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppContainer className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 24,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-0">
            <AppText type="heading" className="text-lg text-center mb-4">
              AFP Weekly Surveillance Report
            </AppText>

            <AppCard className="mb-4" variant="elevated">
              <AppText type="subheading" className="mb-2">
                Reporting Information
              </AppText>
              <AppTextInput
                label="Health Facility"
                value={form.health_facility}
                editable={false}
              />
              <AppTextInput
                label="Reporting Week"
                value={String(form.reporting_week)}
                editable={false}
              />

              <AppTextInput
                label="Period included in the report"
                value={String(form.report_date)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  handleChange("afp_cases_reported", Number(v))
                }
              />
              <AppTextInput
                label="Year"
                value={String(form.year)}
                editable={false}
              />
            </AppCard>

            <AppCard className="mb-4" variant="flat">
              <AppText className="mb-2" type="tag">
                After review of all wards and registry books, please fill in
                this form for the previous week.
              </AppText>
            </AppCard>

            <AppCard className="mb-4" variant="elevated">
              <AppText type="subheading" className="mb-2">
                Weekly Report
              </AppText>

              <AppTextInput
                label="Number of AFP Cases"
                value={String(form.afp_cases_reported)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  handleChange("afp_cases_reported", Number(v))
                }
              />

              <AppTextInput
                label="Focal Person Name"
                value={form.focal_person_name}
                onChangeText={(v) => handleChange("focal_person_name", v)}
                editable={false}
              />

              <AppTextInput
                label="Focal Person Phone"
                value={form.focal_person_phone}
                keyboardType="phone-pad"
                onChangeText={(v) => handleChange("focal_person_phone", v)}
                editable={false}
              />

              <AppTextInput
                label="Report Date (YYYY-MM-DD)"
                value={form.report_date}
                onChangeText={(v) => handleChange("report_date", v)}
                editable={false}
              />
            </AppCard>

            <View className="mt-4">
              <AppButton
                onPress={handleSubmit}
                isLoading={isSubmitting}
                variant="primary"
                className="w-full"
              >
                Submit Report
              </AppButton>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
}
