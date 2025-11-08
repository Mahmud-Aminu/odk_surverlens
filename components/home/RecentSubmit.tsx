import React from "react";
import { Text, View } from "react-native";
import AppCard from "../common/AppCard";
import AppText from "../common/AppText";

const RecentSubmit = () => {
  const recentSubmissions = [
    {
      id: 1,
      form: "Maternal Health Survey",
      submitter: "Field Worker 12",
      time: "10:30 AM",
      status: "synced",
    },
    {
      id: 2,
      form: "Child Vaccination",
      submitter: "Field Worker 08",
      time: "09:15 AM",
      status: "synced",
    },
    {
      id: 3,
      form: "Nutrition Assessment",
      submitter: "Field Worker 15",
      time: "08:45 AM",
      status: "pending",
    },
  ];

  return (
    <View className="w-full">
      <AppText type="body" className="mb-4">
        Recent Submissions
      </AppText>
      <View className="gap-3 rounded-lg overflow-hidden w-full">
        {recentSubmissions.map((submission, idx) => (
          <AppCard
            key={submission.id}
            className={`p-6 flex flex-row items-center justify-between shadow-sm rounded-md`}
          >
            <View className="flex-1">
              <AppText type="body" className="">
                {submission.form}
              </AppText>
              <AppText className="text-xs text-gray-600 mt-1">
                {submission.submitter} • {submission.time}
              </AppText>
            </View>
            <Text
              className={`px-3 py-1 rounded text-xs font-medium ${
                submission.status === "synced"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {submission.status === "synced" ? "Synced" : "Pending"}
            </Text>
          </AppCard>
        ))}
      </View>
    </View>
  );
};

export default RecentSubmit;
