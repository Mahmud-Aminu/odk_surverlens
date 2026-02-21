// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const MonthlyReportTracker = () => {
//   const [currentWeekData, setCurrentWeekData] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [weeklyReport, setWeeklyReport] = useState(null);
//   const [monthlyReport, setMonthlyReport] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Get the Monday 12pm of current week
//   const getMondayNoon = (date = new Date()) => {
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = d.getDate() - day + (day === 0 ? -6 : 1);
//     const monday = new Date(d.setDate(diff));
//     monday.setHours(12, 0, 0, 0);
//     return monday;
//   };

//   // Get week number (1-53)
//   const getWeekNumber = (date) => {
//     const d = new Date(
//       Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
//     );
//     const dayNum = d.getUTCDay() || 7;
//     d.setUTCDate(d.getUTCDate() + 4 - dayNum);
//     const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
//     return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
//   };

//   // Get week identifier (e.g., "2025-W45")
//   const getWeekId = (date = new Date()) => {
//     const monday = getMondayNoon(date);
//     const year = monday.getFullYear();
//     const weekNum = getWeekNumber(monday);
//     return `${year}-W${weekNum}`;
//   };

//   // Get just the week number (e.g., 45)
//   const getCurrentWeekNumber = (date = new Date()) => {
//     return getWeekNumber(date);
//   };

//   // Get month identifier (e.g., "2025-11")
//   const getMonthId = (date = new Date()) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     return `${year}-${month}`;
//   };

//   // Get all weeks in a month
//   const getWeeksInMonth = (monthId) => {
//     const [year, month] = monthId.split("-").map(Number);
//     const firstDay = new Date(year, month - 1, 1);
//     const lastDay = new Date(year, month, 0);

//     const weeks = [];
//     let current = new Date(firstDay);

//     while (current <= lastDay) {
//       const weekId = getWeekId(current);
//       const weekNumber = getWeekNumber(current);
//       if (!weeks.some((w) => w.weekId === weekId)) {
//         weeks.push({ weekId, weekNumber });
//       }
//       current.setDate(current.getDate() + 7);
//     }

//     return weeks;
//   };

//   // Get today's date key
//   const getTodayKey = () => {
//     return new Date().toISOString().split("T")[0];
//   };

//   // Initialize or load week data
//   const initializeWeek = async () => {
//     setLoading(true);
//     const weekId = getWeekId();
//     const weekNumber = getCurrentWeekNumber();
//     const storageKey = `form_tracker_${weekId}`;

//     try {
//       const result = await AsyncStorage.getItem(storageKey);

//       if (result) {
//         const data = JSON.parse(result);
//         setCurrentWeekData(data);
//       } else {
//         const newWeekData = {
//           weekId,
//           weekNumber,
//           mondayDate: getMondayNoon().toISOString(),
//           dailyCases: {},
//           totalCases: 0,
//         };
//         await AsyncStorage.setItem(storageKey, JSON.stringify(newWeekData));
//         setCurrentWeekData(newWeekData);
//       }
//     } catch (error) {
//       console.error("Error loading week data:", error);
//       const newWeekData = {
//         weekId,
//         weekNumber,
//         mondayDate: getMondayNoon().toISOString(),
//         dailyCases: {},
//         totalCases: 0,
//       };
//       setCurrentWeekData(newWeekData);
//     }

//     setLoading(false);
//   };

//   // Track form submission
//   // Only track submissions for afp_f001 (each submission is considered a case)
//   // Optionally accept formId so callers can pass the submitted form id.
//   const trackFormSubmission = async (formId = "afp_f001") => {
//     setIsSubmitting(true);

//     try {
//       if (formId !== "afp_f001") {
//         // Not an AFP immediate case form; we skip tracking
//         alert(
//           "Only AFP immediate case forms (afp_f001) are tracked for weekly reports."
//         );
//         setIsSubmitting(false);
//         return;
//       }

//       const weekId = getWeekId();
//       const weekNumber = getCurrentWeekNumber();
//       const todayKey = getTodayKey();
//       const storageKey = `form_tracker_${weekId}`;

//       if (!currentWeekData || currentWeekData.weekId !== weekId) {
//         // reinitialize for current week
//         await initializeWeek();
//       }

//       // Ensure we have latest week data
//       const latest =
//         currentWeekData && currentWeekData.weekId === weekId
//           ? currentWeekData
//           : {
//               weekId,
//               weekNumber,
//               mondayDate: getMondayNoon().toISOString(),
//               dailyCases: {},
//               totalCases: 0,
//             };

//       const updatedData = {
//         ...latest,
//         weekNumber,
//         dailyCases: {
//           ...latest.dailyCases,
//           [todayKey]: (latest.dailyCases[todayKey] || 0) + 1,
//         },
//       };

//       updatedData.totalCases = Object.values(updatedData.dailyCases).reduce(
//         (sum, count) => sum + count,
//         0
//       );

//       await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
//       setCurrentWeekData(updatedData);

//       alert("AFP case submitted and tracked for this week.");
//     } catch (error) {
//       console.error("Error tracking submission:", error);
//       alert("Form submitted but tracking failed. Please try again.");
//     }

//     setIsSubmitting(false);
//   };

//   // Generate and store weekly report (mandatory)
//   // Only allowed on Sunday (end of week). Optionally provide startDate/endDate (ISO) to generate for a custom range.
//   const generateWeeklyReport = async (
//     startDateISO = null,
//     endDateISO = null,
//     force = false
//   ) => {
//     const now = new Date();
//     const isSunday = now.getDay() === 0; // Sunday === 0

//     if (!force && !isSunday) {
//       alert(
//         "Weekly reports can only be generated on Sunday. Use the range option with force=true to override."
//       );
//       return;
//     }

//     const weekId = getWeekId();
//     const weekNumber = getCurrentWeekNumber();

//     // Determine range: default to Monday - Sunday of current week
//     let start = startDateISO
//       ? new Date(startDateISO)
//       : new Date(getMondayNoon(now));
//     // For default end, use the Sunday of the same week
//     let end = endDateISO ? new Date(endDateISO) : new Date(getMondayNoon(now));
//     // If end was default (monday), shift to sunday by adding 6 days and setting end of day
//     if (!endDateISO) {
//       end = new Date(start);
//       end.setDate(end.getDate() + 6);
//       end.setHours(23, 59, 59, 999);
//     }

//     // Ensure start <= end
//     if (start > end) {
//       const tmp = start;
//       start = end;
//       end = tmp;
//     }

//     // Collect daily counts across possibly multiple weekly storage keys
//     const dailyBreakdown = {};
//     let totalCases = 0;

//     try {
//       // iterate days from start to end inclusive
//       for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//         const dateKey = d.toISOString().split("T")[0];
//         const weekForDay = getWeekId(d);
//         const storageKey = `form_tracker_${weekForDay}`;
//         const raw = await AsyncStorage.getItem(storageKey);
//         if (raw) {
//           try {
//             const wk = JSON.parse(raw);
//             const cnt =
//               wk.dailyCases && wk.dailyCases[dateKey]
//                 ? wk.dailyCases[dateKey]
//                 : 0;
//             dailyBreakdown[dateKey] = cnt;
//             totalCases += cnt;
//           } catch (e) {
//             console.warn(`Failed to parse week data ${storageKey}`, e);
//             dailyBreakdown[dateKey] = 0;
//           }
//         } else {
//           dailyBreakdown[dateKey] = 0;
//         }
//       }

//       // Build report
//       const report = {
//         weekId,
//         weekNumber,
//         startDate: start.toISOString(),
//         endDate: end.toISOString(),
//         totalCases,
//         dailyBreakdown,
//         generatedAt: new Date().toISOString(),
//       };

//       // Choose storage key: if full week (Mon-Sun) and no custom range, save to weekly_report_{weekId}
//       const isFullWeek = !startDateISO && !endDateISO;
//       const reportStorageKey = isFullWeek
//         ? `weekly_report_${weekId}`
//         : `weekly_report_${weekId}_${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`;

//       await AsyncStorage.setItem(reportStorageKey, JSON.stringify(report));
//       setWeeklyReport(report);

//       if (totalCases === 0) {
//         alert("Weekly report generated (no cases found this range).");
//       } else {
//         alert("Weekly report generated and saved!");
//       }
//     } catch (error) {
//       console.error("Error generating report:", error);
//       const report = {
//         weekId,
//         weekNumber,
//         startDate: start.toISOString(),
//         endDate: end.toISOString(),
//         totalCases: 0,
//         dailyBreakdown: {},
//         generatedAt: new Date().toISOString(),
//       };
//       setWeeklyReport(report);
//     }
//   };

//   // Generate monthly report based on weekly reports
//   // Generate monthly report based on weekly reports
//   // Optional startDateISO / endDateISO to restrict the range used for aggregation
//   const generateMonthlyReport = async (
//     startDateISO = null,
//     endDateISO = null
//   ) => {
//     const monthId = getMonthId();
//     const weeksInMonth = getWeeksInMonth(monthId);

//     const weeklyData = [];
//     let totalMonthCases = 0;
//     let reportsFound = 0;
//     let reportsMissing = [];

//     // If a custom date range was supplied, compute the list of weeks that overlap the range
//     let targetWeeks = weeksInMonth;
//     if (startDateISO || endDateISO) {
//       const start = startDateISO
//         ? new Date(startDateISO)
//         : new Date(monthId + "-01");
//       const end = endDateISO
//         ? new Date(endDateISO)
//         : new Date(
//             monthId.split("-")[0],
//             parseInt(monthId.split("-")[1], 10),
//             0
//           );
//       const weeks = new Set();
//       for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//         weeks.add(getWeekId(new Date(d)));
//       }
//       targetWeeks = weeksInMonth.filter((w) => weeks.has(w.weekId));
//     }

//     try {
//       for (const week of targetWeeks) {
//         // try full-week report key first, then any custom-range keys that start with that weekId
//         const reportStorageKey = `weekly_report_${week.weekId}`;
//         try {
//           const result = await AsyncStorage.getItem(reportStorageKey);
//           if (result) {
//             const report = JSON.parse(result);
//             const weekTotal = report.totalCases || 0;
//             totalMonthCases += weekTotal;
//             reportsFound++;

//             weeklyData.push({
//               weekId: week.weekId,
//               weekNumber: report.weekNumber || week.weekNumber,
//               totalCases: weekTotal,
//               dailyBreakdown: report.dailyBreakdown || {},
//               hasReport: true,
//             });
//             continue;
//           }

//           // attempt to find any custom weekly report keys that include this weekId
//           const allKeys = await AsyncStorage.getAllKeys();
//           const matching = allKeys.find((k) =>
//             k.startsWith(`weekly_report_${week.weekId}_`)
//           );
//           if (matching) {
//             const result2 = await AsyncStorage.getItem(matching);
//             if (result2) {
//               const report = JSON.parse(result2);
//               const weekTotal = report.totalCases || 0;
//               totalMonthCases += weekTotal;
//               reportsFound++;
//               weeklyData.push({
//                 weekId: week.weekId,
//                 weekNumber: report.weekNumber || week.weekNumber,
//                 totalCases: weekTotal,
//                 dailyBreakdown: report.dailyBreakdown || {},
//                 hasReport: true,
//               });
//               continue;
//             }
//           }

//           // no report found for this week
//           reportsMissing.push(week.weekNumber);
//           weeklyData.push({
//             weekId: week.weekId,
//             weekNumber: week.weekNumber,
//             totalCases: 0,
//             dailyBreakdown: {},
//             hasReport: false,
//           });
//         } catch (error) {
//           console.error(`Error loading week report ${week.weekId}:`, error);
//           reportsMissing.push(week.weekNumber);
//           weeklyData.push({
//             weekId: week.weekId,
//             weekNumber: week.weekNumber,
//             totalCases: 0,
//             dailyBreakdown: {},
//             hasReport: false,
//           });
//         }
//       }

//       const report = {
//         monthId,
//         totalCases: totalMonthCases,
//         weeksCount: targetWeeks.length,
//         reportsGenerated: reportsFound,
//         reportsMissing: reportsMissing.length > 0 ? reportsMissing : null,
//         weeklyBreakdown: weeklyData,
//         averageCasesPerWeek:
//           targetWeeks.length > 0
//             ? (totalMonthCases / targetWeeks.length).toFixed(2)
//             : 0,
//         generatedAt: new Date().toISOString(),
//       };

//       const monthlyStorageKey = `monthly_report_${monthId}`;
//       await AsyncStorage.setItem(monthlyStorageKey, JSON.stringify(report));
//       setMonthlyReport(report);

//       if (reportsMissing.length > 0) {
//         alert(
//           `Monthly report generated!\nNote: ${reportsMissing.length} week(s) missing reports (Week ${reportsMissing.join(", ")})`
//         );
//       } else {
//         alert("Monthly report generated successfully!");
//       }
//     } catch (error) {
//       console.error("Error generating monthly report:", error);
//       const report = {
//         monthId,
//         totalCases: 0,
//         weeksCount: 0,
//         reportsGenerated: 0,
//         reportsMissing: null,
//         weeklyBreakdown: [],
//         averageCasesPerWeek: 0,
//         generatedAt: new Date().toISOString(),
//       };
//       setMonthlyReport(report);
//     }
//   };

//   useEffect(() => {
//     initializeWeek();

//     const interval = setInterval(() => {
//       const now = new Date();
//       const mondayNoon = getMondayNoon();

//       if (
//         now >= mondayNoon &&
//         currentWeekData &&
//         currentWeekData.weekId !== getWeekId()
//       ) {
//         initializeWeek();
//       }
//     }, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   const getMonthName = (monthId) => {
//     const [year, month] = monthId.split("-");
//     const date = new Date(year, month - 1);
//     return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4F46E5" />
//         <Text style={styles.loadingText}>Loading tracker...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={styles.contentContainer}
//     >
//       {/* Current Week Section */}
//       <View style={styles.card}>
//         <Text style={styles.title}>Form Submission Tracker</Text>

//         <View style={styles.infoBox}>
//           <Text style={styles.infoText}>
//             Current Week:{" "}
//             <Text style={styles.infoTextBold}>
//               Week {currentWeekData?.weekNumber}
//             </Text>
//           </Text>
//           <Text style={styles.infoTextSmall}>
//             Week ID: {currentWeekData?.weekId} • Resets: Monday at 12:00 PM
//           </Text>
//         </View>

//         <View style={styles.statsGrid}>
//           <View style={[styles.statCard, styles.statCardGreen]}>
//             <Text style={styles.statLabel}>Total Cases This Week</Text>
//             <Text style={styles.statValue}>
//               {currentWeekData?.totalCases || 0}
//             </Text>
//           </View>

//           <View style={[styles.statCard, styles.statCardBlue]}>
//             <Text style={styles.statLabel}>Cases Today</Text>
//             <Text style={styles.statValue}>
//               {currentWeekData?.dailyCases?.[getTodayKey()] || 0}
//             </Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           onPress={trackFormSubmission}
//           disabled={isSubmitting}
//           style={[styles.button, isSubmitting && styles.buttonDisabled]}
//         >
//           <Text style={styles.buttonText}>
//             {isSubmitting ? "Submitting..." : "Submit Form & Track Case"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Weekly Report */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Weekly Report (Mandatory)</Text>
//           <TouchableOpacity
//             onPress={generateWeeklyReport}
//             style={styles.generateButton}
//           >
//             <Text style={styles.generateButtonText}>Generate</Text>
//           </TouchableOpacity>
//         </View>

//         {weeklyReport ? (
//           <View>
//             <View style={styles.reportInfoBox}>
//               <Text style={styles.reportInfoText}>
//                 Week {weeklyReport.weekNumber}{" "}
//                 <Text style={styles.reportInfoTextBold}>
//                   ({weeklyReport.weekId})
//                 </Text>
//               </Text>
//               <Text style={styles.reportInfoTextSmall}>
//                 Generated: {new Date(weeklyReport.generatedAt).toLocaleString()}
//               </Text>
//             </View>

//             <View
//               style={[styles.reportTotalCard, styles.reportTotalCardPurple]}
//             >
//               <Text style={styles.reportTotalLabel}>Total Cases</Text>
//               <Text style={styles.reportTotalValue}>
//                 {weeklyReport.totalCases}
//               </Text>
//             </View>

//             {Object.keys(weeklyReport.dailyBreakdown).length > 0 ? (
//               <View style={styles.breakdownContainer}>
//                 <Text style={styles.breakdownTitle}>Daily Breakdown</Text>
//                 <ScrollView style={styles.breakdownScroll}>
//                   {Object.entries(weeklyReport.dailyBreakdown).map(
//                     ([date, count]) => (
//                       <View key={date} style={styles.breakdownItem}>
//                         <Text style={styles.breakdownDate}>
//                           {new Date(date).toLocaleDateString("en-US", {
//                             weekday: "short",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </Text>
//                         <Text style={styles.breakdownCount}>{count}</Text>
//                       </View>
//                     )
//                   )}
//                 </ScrollView>
//               </View>
//             ) : (
//               <Text style={styles.emptyText}>No cases this week</Text>
//             )}
//           </View>
//         ) : (
//           <Text style={styles.emptyText}>
//             Click &quot;Generate&quot; to create weekly report
//           </Text>
//         )}
//       </View>

//       {/* Monthly Report */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Text style={styles.cardTitle}>Monthly Report</Text>
//           <TouchableOpacity
//             onPress={generateMonthlyReport}
//             style={[styles.generateButton, styles.generateButtonOrange]}
//           >
//             <Text style={styles.generateButtonText}>Generate</Text>
//           </TouchableOpacity>
//         </View>

//         {monthlyReport ? (
//           <View>
//             <View style={[styles.reportInfoBox, styles.reportInfoBoxOrange]}>
//               <Text style={styles.reportInfoText}>
//                 Month:{" "}
//                 <Text style={styles.reportInfoTextBold}>
//                   {getMonthName(monthlyReport.monthId)}
//                 </Text>
//               </Text>
//               <Text style={styles.reportInfoTextSmall}>
//                 Generated:{" "}
//                 {new Date(monthlyReport.generatedAt).toLocaleString()}
//               </Text>
//               <Text style={styles.reportInfoTextSmall}>
//                 Reports: {monthlyReport.reportsGenerated}/
//                 {monthlyReport.weeksCount} weeks
//               </Text>
//             </View>

//             {monthlyReport.reportsMissing && (
//               <View style={styles.warningBox}>
//                 <Text style={styles.warningText}>
//                   ⚠️ Missing weekly reports for: Week{" "}
//                   {monthlyReport.reportsMissing.join(", ")}
//                 </Text>
//               </View>
//             )}

//             <View style={styles.monthlyStatsGrid}>
//               <View
//                 style={[styles.monthlyStatCard, styles.monthlyStatCardOrange]}
//               >
//                 <Text style={styles.monthlyStatLabel}>Total Cases</Text>
//                 <Text style={styles.monthlyStatValue}>
//                   {monthlyReport.totalCases}
//                 </Text>
//               </View>

//               <View
//                 style={[styles.monthlyStatCard, styles.monthlyStatCardBlue]}
//               >
//                 <Text style={styles.monthlyStatLabel}>Avg/Week</Text>
//                 <Text style={styles.monthlyStatValue}>
//                   {monthlyReport.averageCasesPerWeek}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.breakdownContainer}>
//               <Text style={styles.breakdownTitle}>
//                 Weekly Breakdown ({monthlyReport.weeksCount} weeks)
//               </Text>

//               {monthlyReport.weeklyBreakdown.length > 0 ? (
//                 <ScrollView style={styles.weeklyBreakdownScroll}>
//                   {monthlyReport.weeklyBreakdown.map((week) => (
//                     <View
//                       key={week.weekId}
//                       style={[
//                         styles.weeklyBreakdownItem,
//                         !week.hasReport && styles.weeklyBreakdownItemMissing,
//                       ]}
//                     >
//                       <View style={styles.weeklyBreakdownHeader}>
//                         <Text style={styles.weeklyBreakdownWeek}>
//                           Week {week.weekNumber}{" "}
//                           {!week.hasReport && "(No Report)"}
//                         </Text>
//                         <Text style={styles.weeklyBreakdownTotal}>
//                           {week.totalCases} cases
//                         </Text>
//                       </View>
//                       {Object.keys(week.dailyBreakdown).length > 0 && (
//                         <View style={styles.dailyChips}>
//                           {Object.entries(week.dailyBreakdown).map(
//                             ([date, count]) => (
//                               <View key={date} style={styles.dailyChip}>
//                                 <Text style={styles.dailyChipText}>
//                                   {new Date(date).getDate()}: {count}
//                                 </Text>
//                               </View>
//                             )
//                           )}
//                         </View>
//                       )}
//                     </View>
//                   ))}
//                 </ScrollView>
//               ) : (
//                 <Text style={styles.emptyText}>No weekly data available</Text>
//               )}
//             </View>
//           </View>
//         ) : (
//           <Text style={styles.emptyText}>
//             Click &quot;Generate&quot; to view monthly statistics
//           </Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EEF2FF",
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#EEF2FF",
//   },
//   loadingText: {
//     marginTop: 12,
//     color: "#6B7280",
//     fontSize: 16,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1F2937",
//     marginBottom: 16,
//   },
//   infoBox: {
//     backgroundColor: "#E0E7FF",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   infoText: {
//     fontSize: 14,
//     color: "#3730A3",
//     marginBottom: 4,
//   },
//   infoTextBold: {
//     fontWeight: "bold",
//   },
//   infoTextSmall: {
//     fontSize: 12,
//     color: "#4F46E5",
//   },
//   statsGrid: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 16,
//   },
//   statCard: {
//     flex: 1,
//     borderRadius: 8,
//     padding: 16,
//   },
//   statCardGreen: {
//     backgroundColor: "#D1FAE5",
//   },
//   statCardBlue: {
//     backgroundColor: "#DBEAFE",
//   },
//   statLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#065F46",
//     marginBottom: 8,
//   },
//   statValue: {
//     fontSize: 32,
//     fontWeight: "bold",
//     color: "#059669",
//   },
//   button: {
//     backgroundColor: "#4F46E5",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//   },
//   buttonDisabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1F2937",
//   },
//   generateButton: {
//     backgroundColor: "#9333EA",
//     borderRadius: 8,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//   },
//   generateButtonOrange: {
//     backgroundColor: "#EA580C",
//   },
//   generateButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   reportInfoBox: {
//     backgroundColor: "#F3E8FF",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   reportInfoBoxOrange: {
//     backgroundColor: "#FFEDD5",
//   },
//   reportInfoText: {
//     fontSize: 14,
//     color: "#6B21A8",
//     marginBottom: 4,
//   },
//   reportInfoTextBold: {
//     fontWeight: "bold",
//   },
//   reportInfoTextSmall: {
//     fontSize: 11,
//     color: "#9333EA",
//     marginTop: 2,
//   },
//   warningBox: {
//     backgroundColor: "#FEF3C7",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: "#F59E0B",
//   },
//   warningText: {
//     fontSize: 12,
//     color: "#92400E",
//     fontWeight: "500",
//   },
//   reportTotalCard: {
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//   },
//   reportTotalCardPurple: {
//     backgroundColor: "#F3E8FF",
//   },
//   reportTotalLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#6B21A8",
//     marginBottom: 8,
//   },
//   reportTotalValue: {
//     fontSize: 36,
//     fontWeight: "bold",
//     color: "#9333EA",
//   },
//   breakdownContainer: {
//     backgroundColor: "#F9FAFB",
//     borderRadius: 8,
//     padding: 12,
//   },
//   breakdownTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: 12,
//   },
//   breakdownScroll: {
//     maxHeight: 200,
//   },
//   breakdownItem: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   breakdownDate: {
//     fontSize: 14,
//     color: "#374151",
//   },
//   breakdownCount: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#4F46E5",
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#6B7280",
//     fontSize: 14,
//     paddingVertical: 32,
//   },
//   monthlyStatsGrid: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 12,
//   },
//   monthlyStatCard: {
//     flex: 1,
//     borderRadius: 8,
//     padding: 12,
//   },
//   monthlyStatCardOrange: {
//     backgroundColor: "#FFEDD5",
//   },
//   monthlyStatCardBlue: {
//     backgroundColor: "#DBEAFE",
//   },
//   monthlyStatLabel: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#9A3412",
//     marginBottom: 4,
//   },
//   monthlyStatValue: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#EA580C",
//   },
//   weeklyBreakdownScroll: {
//     maxHeight: 300,
//   },
//   weeklyBreakdownItem: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 8,
//   },
//   weeklyBreakdownItemMissing: {
//     backgroundColor: "#FEF3C7",
//     borderLeftWidth: 3,
//     borderLeftColor: "#F59E0B",
//   },
//   weeklyBreakdownHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   weeklyBreakdownWeek: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#374151",
//   },
//   weeklyBreakdownTotal: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#EA580C",
//   },
//   dailyChips: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 4,
//     marginTop: 8,
//   },
//   dailyChip: {
//     backgroundColor: "#F3F4F6",
//     borderRadius: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   dailyChipText: {
//     fontSize: 11,
//     color: "#374151",
//   },
// });

// export default MonthlyReportTracker;

import AppButton from "@/components/common/AppButton";
import AppCard from "@/components/common/AppCard";
import AppText from "@/components/common/AppText";
import {
  FormData,
  FormDefinition,
  FormField,
  GroupField,
  ValidationError,
} from "@/types/FormFieldTypes";
import { validateField } from "@/utils/validation";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import FormFieldComponent from "./FormField";

interface FormRendererProps {
  formDefinition: FormDefinition;
  initialData?: FormData;
  onChange: (data: FormData) => void;
  onValidation: (errors: ValidationError[]) => void;
  readOnly?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  formDefinition,
  initialData = {},
  onChange,
  onValidation,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    onChange(formData);
    const errors = validateAllFields();
    onValidation(errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAllFields = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    formDefinition.fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) errors.push(error);
    });
    return errors;
  };

  const renderField = (field: FormField) => {
    if (field.type === "group") {
      const group = field as GroupField;
      return (
        <View
          key={group.name}
          className="mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
        >
          <AppText className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            {group.label}
          </AppText>
          {group.fields.map(renderField)}
        </View>
      );
    }

    return (
      <FormFieldComponent
        key={field.name}
        field={field}
        value={formData[field.name]}
        onChange={(value) => handleFieldChange(field.name, value)}
      // readOnly={readOnly} // Prop not currently supported in FormField but kept for future
      />
    );
  };

  const renderSteppedForm = (steps: GroupField[]) => {
    const step = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const validateStep = () => {
      const errs: ValidationError[] = [];
      step.fields.forEach((f) => {
        const e = validateField(f, formData[f.name]);
        if (e) errs.push(e);
      });
      return errs;
    };

    const handleNext = () => {
      const errors = validateStep();
      if (errors.length > 0) {
        onValidation(errors); // Update parent with errors
        Alert.alert("Validation Error", "Please fix the errors in this step before continuing.");
        return;
      }
      setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
    };

    const handlePrev = () => {
      setCurrentStep((s) => Math.max(0, s - 1));
    };

    return (
      <View>
        {/* Step Progress Card */}
        <AppCard className="mb-6 p-4" variant="elevated">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                <AppText className="text-blue-600 dark:text-blue-400 font-bold">
                  {currentStep + 1}
                </AppText>
              </View>
              <View>
                <AppText className="font-bold text-base">
                  Step {currentStep + 1}
                </AppText>
                <AppText className="text-xs text-gray-500">
                  of {steps.length}: {step.label}
                </AppText>
              </View>
            </View>
          </View>
          {/* Progress Bar */}
          <View className="h-1 bg-gray-100 dark:bg-gray-700 mt-4 rounded-full overflow-hidden">
            <View
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </View>
        </AppCard>

        {/* Form Fields for current step */}
        <View key={step.name} className="mb-6">
          {step.fields.map(renderField)}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-4 pb-10">
          <AppButton
            variant="outline"
            onPress={handlePrev}
            disabled={isFirstStep}
            className={isFirstStep ? "opacity-0" : "flex-1 mr-2"}
            leftIcon={<Feather name="arrow-left" size={18} color={isFirstStep ? "transparent" : "currentColor"} />}
          >
            Previous
          </AppButton>

          <AppButton
            variant="primary"
            onPress={handleNext}
            disabled={isLastStep && readOnly}
            className="flex-1 ml-2"
            rightIcon={!isLastStep ? <Feather name="arrow-right" size={18} color="white" /> : undefined}
          >
            {isLastStep ? (readOnly ? "Review" : "Finish") : "Next"}
          </AppButton>
        </View>
      </View>
    );
  };

  // Check if form should be rendered as stepped (all top-level fields are groups)
  const isStepped = formDefinition.fields.length > 1 && formDefinition.fields.every((f) => f.type === "group");

  return (
    <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
      {isStepped
        ? renderSteppedForm(formDefinition.fields as GroupField[])
        : (
          <View className="pb-10">
            {formDefinition.fields.map(renderField)}
          </View>
        )
      }
    </ScrollView>
  );
};

export default FormRenderer;

