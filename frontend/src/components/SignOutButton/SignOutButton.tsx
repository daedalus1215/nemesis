import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import styles from "./SignOutButton.module.css";

export const SignOutButton: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button className={styles.signOutButton} onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

