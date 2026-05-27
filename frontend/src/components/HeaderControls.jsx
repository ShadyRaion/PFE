import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageProvider";

function HeaderControls({ className = "" }) {
  const { language, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} data-no-translate>
      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#cfe1e8] bg-white text-sm font-bold text-slate-700 shadow-sm hover:bg-cyan-50"
        title="Change theme"
      >
        {theme === "dark" ? "☀" : "◐"}
      </button>

      <button
        onClick={toggleLanguage}
        className="flex h-9 w-10 items-center justify-center rounded-lg border border-[#cfe1e8] bg-white text-sm font-bold text-cyan-700 shadow-sm hover:bg-cyan-50"
        title="Change language"
      >
        {language}
      </button>
    </div>
  );
}

export default HeaderControls;
