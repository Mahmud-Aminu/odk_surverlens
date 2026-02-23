export const getISOWeekInfo = () => {
  const now = new Date();

  // Get Monday of current week
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() + diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7); // exclusive upper bound

  // ISO week number
  const temp = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((+temp - +yearStart) / 86400000 + 1) / 7);

  return { weekStart, weekEnd, weekNumber };
};
export const getCurrentWeekRange = (): string => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday

  // Calculate Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  // Sunday = Monday + 6
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  return `Monday ${format(monday)} - Sunday ${format(sunday)}`;
};
