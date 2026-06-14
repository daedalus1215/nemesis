import React from "react";
import { NavLink } from "react-router-dom";
import {
  AccountBalance,
  AttachMoney,
  AccountBox,
  TrendingFlat,
  Receipt,
  Autorenew,
} from "@mui/icons-material";
import { BottomNavigation } from "../BottomNavigation/BottomNavigation";
import { SignOutButton } from "../SignOutButton/SignOutButton";
import { useAuth } from "../../auth/useAuth";
import styles from "./AppShell.module.css";

/** Keys recognised by the mobile BottomNavigation. */
type BottomNavKey = "Home" | "Send" | "Accounts" | "Transfer" | "Invoices";

const navItems = [
  { label: "Home", to: "/", icon: <AccountBalance /> },
  { label: "Accounts", to: "/accounts", icon: <AccountBox /> },
  { label: "Send", to: "/money", icon: <AttachMoney /> },
  { label: "Transfer", to: "/accounts/transfer", icon: <TrendingFlat /> },
  { label: "Invoices", to: "/invoices", icon: <Receipt /> },
  { label: "Recurring", to: "/recurring-invoices", icon: <Autorenew /> },
];

interface AppShellProps {
  /** Active item for the mobile bottom navigation. */
  selected: BottomNavKey;
  /** Title shown in the top bar. */
  title: string;
  children: React.ReactNode;
}

/**
 * Responsive application shell: a persistent left sidebar on desktop and the
 * existing bottom navigation on mobile, wrapping a centred, scrollable content
 * column. Page content lives in `children`. The signed-in user's name is read
 * from auth, so pages only need to supply `selected` and `title`.
 */
export const AppShell: React.FC<AppShellProps> = ({
  selected,
  title,
  children,
}) => {
  const { user } = useAuth();
  const username = user?.username;
  const initials = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>N</span>
          <span className={styles.brandName}>Nemesis</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.userName}>{username ?? "User"}</span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.topbarUser}>
            <div className={styles.avatar}>{initials}</div>
            <SignOutButton />
          </div>
        </header>

        <main className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>

        <div className={styles.bottomNav}>
          <BottomNavigation selected={selected} />
        </div>
      </div>
    </div>
  );
};
