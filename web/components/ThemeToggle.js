import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading DOM/localStorage state that isn't known until mount (SSR has no theme)
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (isDark === null) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--ink-secondary)] hover:bg-[var(--surface-2)]"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm0 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm9-6a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5 12a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zm12.02-6.36a1 1 0 01.02 1.41l-.71.71a1 1 0 11-1.41-1.41l.7-.71a1 1 0 011.4 0zM7.1 16.95a1 1 0 01.02 1.41l-.71.71a1 1 0 11-1.41-1.41l.7-.71a1 1 0 011.4 0zm9.9 1.41a1 1 0 01-1.41 0l-.71-.7a1 1 0 111.41-1.42l.71.71a1 1 0 010 1.41zM6.34 7.05a1 1 0 01-1.41 0l-.71-.7a1 1 0 011.41-1.42l.71.71a1 1 0 010 1.41zM12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M20.354 15.354A9 9 0 018.646 3.646a9.003 9.003 0 1011.708 11.708z" />
        </svg>
      )}
    </button>
  );
}
