import React from "react";
import { useNavigate } from "react-router-dom";
import { Register } from "./components/Register";
import { useAuth } from "../../auth/useAuth";
import styles from "./RegisterPage.module.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [backendError, setBackendError] = React.useState<string | null>(null);

  const handleRegister = async (username: string, password: string) => {
    setBackendError(null);
    try {
      const result = await register(username, password);
      console.log("result", result);
      if (result === true) {
        navigate("/login", { replace: true });
        return true;
      } else {
        setBackendError(result);
        return false;
      }
    } catch (error: unknown) {
      setBackendError("An error occurred during registration: " + error);
      return false;
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className={styles.registerPage}>
      <Register onRegister={handleRegister} backendError={backendError} />
    </div>
  );
}
