import React, { useState } from "react";
import { Logo } from "../../../components/Logo/Logo";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { LinkAndTitle } from "../../../components/LinkAndTitle/LinkAndTitle";
import { Typography } from "@mui/material";
import styles from "./Register.module.css";

type RegisterProps = {
  onRegister: (username: string, password: string) => Promise<boolean>;
  backendError?: string | null;
};

export const Register: React.FC<RegisterProps> = ({
  onRegister,
  backendError,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onRegister(username, password);
    } catch {
      setError("An error occurred during registration");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.content}>
        <Logo className={styles.logo} />

        <div className={styles.actionSection}>
          <Typography variant="h2">Register</Typography>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            {backendError && <div className={styles.error}>{backendError}</div>}
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: "9999px",
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                mt: 2,
              }}
            >
              Register
            </Button>
          </form>
          <LinkAndTitle
            title="Already have an account?"
            link="/login"
            linkText="Login here"
          />
        </div>
      </div>
    </div>
  );
};
