export const getCurrentWeekNumber = (): number => {
  const now = new Date();

  // Copy date so we don't mutate
  const date = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );

  // Set to nearest Thursday (ISO week rule)
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);

  return weekNo;
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
