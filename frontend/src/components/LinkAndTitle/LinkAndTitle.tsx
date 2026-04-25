import { Link } from "../Link/Link";
import styles from "./LinkAndTitle.module.css";

export const LinkAndTitle = ({ title, link, linkText }: { title: string, link: string, linkText: string }) => {
  return (
    <div className={styles.link}>
    <span className={styles.linkText}>{title}</span> 
    <Link routeName={link} text={linkText} />
  </div>
  );
};