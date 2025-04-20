export const toMinute = (seconds: number | null) => {
  if (!seconds || seconds === 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const convertToSeconds = (t: { minutes?: string; seconds?: string }) =>
  parseInt(t.minutes ?? "0") * 60 + parseInt(t.seconds ?? "0");

export const formatCategory = (key: string) => {
  switch (key) {
    case "warning":
      return "Warming Up";
    case "main":
      return "Main Set";
    case "sprint":
      return "Sprint";
    case "down":
      return "Cooling Down";
    default:
      return key;
  }
};
