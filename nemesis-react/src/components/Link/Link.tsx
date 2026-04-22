import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import styles from "./Link.module.css";

export const Link = ({
  routeName,
  text,
}: {
  routeName: string;
  text: string;
}) => {
  return (
    <div className={styles.link}>
      <MuiLink component={RouterLink} to={routeName}>
        {text}
      </MuiLink>
    </div>
  );
};
