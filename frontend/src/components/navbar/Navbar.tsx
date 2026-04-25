import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <img
        onClick={() => navigate("/home")}
        src="/favicon.svg"
        alt="App Logo"
        className={styles.logo}
      />
      <div className={styles.title}>Nemesis</div>
    </nav>
  );
}

export default Navbar;
