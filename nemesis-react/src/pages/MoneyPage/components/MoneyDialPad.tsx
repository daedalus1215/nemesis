import React from "react";
import styles from "./MoneyDialPad.module.css";

type MoneyDialPadProps = {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
};

const numberPadKeys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "⌫"],
];

const MoneyDialPad: React.FC<MoneyDialPadProps> = ({ amount, setAmount }) => {
  const handleKeyPress = (key: string) => {
    if (key === "⌫") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + ".");
    } else {
      if (amount.length < 7)
        setAmount((prev) => (prev === "0" ? key : prev + key));
    }
  };

  return (
    <div className={styles.dialPad}>
      {numberPadKeys.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          {row.map((key, colIdx) => (
            <button
              key={key + colIdx}
              type="button"
              className={styles.button}
              onClick={() => handleKeyPress(key)}
            >
              {key === "⌫" ? (
                <svg
                  className={styles.backspaceIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export { MoneyDialPad }; 