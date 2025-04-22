import { useMemo } from "react";

export const useSelectOptions = () => {
  const volumeOptions = useMemo(
    () =>
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((v) => ({
        label: v,
        value: v,
      })),
    []
  );

  const jarakOptions = useMemo(
    () => ["50", "100", "200"].map((v) => ({ label: v, value: v })),
    []
  );

  const gayaOptions = useMemo(
    () =>
      ["Dada", "Bebas", "Punggung", "Kupu"].map((v) => ({
        label: v,
        value: v,
      })),
    []
  );

  const alatOptions = useMemo(
    () =>
      ["Fins", "Paddle", "Paddle + Fins", "Snorkel"].map((v) => ({
        label: v,
        value: v,
      })),
    []
  );

  return { volumeOptions, jarakOptions, gayaOptions, alatOptions };
};
