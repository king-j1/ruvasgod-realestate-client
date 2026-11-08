import { useLanguage } from "../context/LanguageContext";

function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-control">
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
      </select>
    </label>
  );
}

export default LanguageSelect;
