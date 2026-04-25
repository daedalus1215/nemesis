import React from "react";
import styles from "./ErrorMessage.module.css";

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  const getErrorMessage = (err: unknown) => {
    if (typeof err === "object" && err !== null) {
      if (
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        return (err as { response: { data: { message: string } } }).response
          .data.message;
      }
      if (
        "message" in err &&
        typeof (err as { message?: string }).message === "string"
      ) {
        return (err as { message: string }).message;
      }
    }
    return "An error occurred.";
  };

  const errorMessage = getErrorMessage(message);

  return (
    <div className={styles.error}>
      <p>{errorMessage}</p>
    </div>
  );
};
