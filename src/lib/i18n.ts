import { createContext, useContext } from "react";
import translationsData from "./translations.json";

export type Lang = "th" | "en";

const data = translationsData as Record<string, any>;

export type Translations = typeof data.en;

export const translations = data;

export const LangContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: any;
}>({
  lang: "th",
  setLang: () => {},
  t: data.th,
});

export const useLang = () => useContext(LangContext);
