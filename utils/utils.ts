import { Day } from "@/store/useAgendaStore";

export const formatMillis = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const ms = Math.floor((millis % 1000) / 10)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}.${ms}`;
};

export const toMinute = (seconds: number | null) => {
  if (!seconds || seconds === 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const today = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
}).format(new Date()) as Day;

export const convertToSeconds = (t: { minutes?: string; seconds?: string }) =>
  parseInt(t.minutes ?? "0") * 60 + parseInt(t.seconds ?? "0");

export const formatCategory = (key: string) => {
  switch (key) {
    case "warming":
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
