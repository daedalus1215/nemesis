import React, { useState } from "react";
import axios from "axios";
import { Logo } from "../../../components/Logo/Logo";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Typography } from "@mui/material";
import { LinkAndTitle } from "../../../components/LinkAndTitle/LinkAndTitle";
import { isTauri } from "../../../tauri/api-config";
import { openConnectionSettings } from "../../../tauri/connection-settings";
import styles from "./Login.module.css";

type LoginProps = {
  onLogin: (username: string, password: string) => Promise<boolean>;
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const success = await onLogin(username, password);
      if (!success) {
        setError("Invalid credentials");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError(
          isTauri()
            ? "Couldn't reach Nemesis. Check your connection, or the server settings below."
            : "Couldn't reach Nemesis. Check your connection and try again."
        );
      } else {
        setError("An error occurred during login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.content}>
        <Logo className={styles.logo} />

        <div className={styles.actionSection}>
          <Typography variant="h2" className={styles.title}>
            Login
          </Typography>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              sx={{
                borderRadius: "9999px",
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
          <LinkAndTitle
            title="Don't have an account?"
            link="/register"
            linkText="Register here"
          />
          {isTauri() && (
            <Button
              size="small"
              onClick={() => openConnectionSettings()}
              sx={{ alignSelf: "center", textTransform: "none" }}
            >
              Server settings
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
