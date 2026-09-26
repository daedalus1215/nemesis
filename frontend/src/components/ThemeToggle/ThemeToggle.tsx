import React, { useEffect, useRef, useState } from "react";
import { BrightnessAuto, DarkMode, LightMode } from "@mui/icons-material";
import { useThemeMode } from "../../context/ThemeContext";
import { AppThemeMode } from "../../context/theme";
import styles from "./ThemeToggle.module.css";

const MODES: { value: AppThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <LightMode fontSize="small" /> },
  { value: "dark", label: "Dark", icon: <DarkMode fontSize="small" /> },
  { value: "auto", label: "Auto", icon: <BrightnessAuto fontSize="small" /> },
];

/**
 * Light / dark / auto theme switcher shown in the top bar. The selection is
 * stored in the theme context, which persists it and applies it to the page.
 */
export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const current = MODES.find((option) => option.value === mode) ?? MODES[2];

  return (
    <div className={styles.themeToggle} ref={containerRef}>
      <button
        type="button"
        className={styles.themeButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Theme: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {current.icon}
      </button>
      {open && (
        <div className={styles.themeMenu} role="menu">
          {MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === mode}
              className={`${styles.themeMenuItem} ${
                option.value === mode ? styles.themeMenuItemActive : ""
              }`}
              onClick={() => {
                setMode(option.value);
                setOpen(false);
              }}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              {option.value === mode && (
                <span className={styles.themeCheck} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
