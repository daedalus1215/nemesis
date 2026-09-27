import React from "react";
import { BrightnessAuto, DarkMode, LightMode } from "@mui/icons-material";
import styles from "../../SettingsPage.module.css";
import { useThemeMode } from "../../../../context/ThemeContext";

const MODES = [
  { value: "light", label: "Light", icon: <LightMode fontSize="small" /> },
  { value: "dark", label: "Dark", icon: <DarkMode fontSize="small" /> },
  { value: "auto", label: "Auto", icon: <BrightnessAuto fontSize="small" /> },
] as const;

/**
 * Appearance card. Bound to the same ThemeContext as the top-bar
 * ThemeToggle, so both stay in sync; the choice persists in localStorage.
 */
export const ThemeSettings: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Appearance</h2>
      <p className={styles.cardSubtitle}>
        Pick a fixed theme, or follow your system setting. The choice is
        remembered on this device.
      </p>
      <div className={styles.themeOptions} role="radiogroup" aria-label="Theme">
        {MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={mode === option.value}
            className={`${styles.themeOption} ${
              mode === option.value ? styles.themeOptionActive : ""
            }`}
            onClick={() => setMode(option.value)}
          >
            <span className={styles.themeIcon}>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
