import { db } from "@/firebaseConfig";
import { getISOWeekInfo } from "@/helpers/helpers";
import {
    collection,
    getCountFromServer,
    query,
    Timestamp,
    where,
} from "firebase/firestore";

export const getUserWeeklyAfpStats = async (userUid: string) => {
  try {
    const { weekStart, weekEnd, weekNumber } = getISOWeekInfo();

    const afpRef = collection(db, "afp");

    const q = query(
      afpRef,
      where("uid", "==", userUid),
      where("createdAt", ">=", Timestamp.fromDate(weekStart)),
      where("createdAt", "<", Timestamp.fromDate(weekEnd)),
    );

    const snapshot = await getCountFromServer(q);
    const count = snapshot.data().count;

    const format = (date: Date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };

    return {
      weeklyCount: count,
      weekNumber,
      weekRange: `Monday ${format(weekStart)} - Sunday ${format(
        new Date(weekEnd.getTime() - 86400000),
      )}`,
    };
  } catch (error) {
    console.error("Error getting weekly AFP stats:", error);
    return {
      weeklyCount: 0,
      weekNumber: 0,
      weekRange: "",
    };
  }
};
