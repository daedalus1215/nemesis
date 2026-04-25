import React from "react";
import styles from "./Button.module.css";

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button className={styles.button} onClick={onClick}>
    {children}
  </button>
);

export default Button;
