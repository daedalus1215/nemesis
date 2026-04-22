import { Box, Button, Typography } from "@mui/material";
import { Logo } from "../../../components/Logo/Logo";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

type LandingProps = {
  navigate: (path: string) => void;
};

export const Landing: React.FC<LandingProps> = ({ navigate }) => {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.content}>
        <Logo className={styles.logo} />

        <div className={styles.actionSection}>
          <Typography variant="h2" className={styles.title}>
            Nemesis
          </Typography>
          <div className={styles.buttonGroup}>
            <Button
              onClick={() => navigate("/register")}
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                borderRadius: "9999px",
                py: 1.5,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Create account
            </Button>

            <Box className={styles.divider}>
              <span>or</span>
            </Box>

            <div className={styles.signInSection}>
              <p>Already have an account?</p>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="primary"
                fullWidth
                sx={{
                  borderRadius: "9999px",
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                }}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
