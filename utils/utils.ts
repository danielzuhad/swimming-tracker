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

export const getTodayKey = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const toMinuteFromMili = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}:${seconds.padStart(5, "0")}`;
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

export function formatDate(dateString: string): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Pastikan format sesuai dengan standar Date
  const date = new Date(dateString);

  // Handle jika tanggal tidak valid
  if (isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  // Konversi ke waktu lokal
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  const day = localDate.getDate();
  const month = months[localDate.getMonth()];
  const year = localDate.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatDateWithTime(dateString: string): string {
  if (!dateString) {
    return "-";
  }

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Parsing Date dengan memastikan format yang benar
  const date = new Date(dateString);

  // Handle jika tanggal tidak valid
  if (isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  // Gunakan waktu lokal
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}
