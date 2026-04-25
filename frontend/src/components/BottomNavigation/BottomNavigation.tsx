import React from "react";
import { AccountBalance, AttachMoney, AccountBox, TrendingFlat, Receipt } from "@mui/icons-material";
import {
  BottomNavigationAction,
  BottomNavigation as MuiBottomNavigation,
} from "@mui/material";
import styles from "./BottomNavigation.module.css";

const labels = {
  Home: "Home",
  Send: "Send",
  Accounts: "Accounts",
  Transfer: "Transfer",
  Invoices: "Invoices",
} as const;

export const BottomNavigation: React.FC<{ selected: keyof typeof labels }> = ({ selected }) => {
  const [value, setValue] = React.useState(selected);
  return (
    <MuiBottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue) => {
        setValue(newValue);
      }}
      className={styles.bottomNavigation}
    >
      <BottomNavigationAction value="Home" label={labels.Home} icon={<AccountBalance />} href="/" />
      <BottomNavigationAction value="Send" label={labels.Send} icon={<AttachMoney />} href="/money" />
      <BottomNavigationAction value="Accounts" label={labels.Accounts} icon={<AccountBox />} href="/accounts" />
      <BottomNavigationAction value="Transfer" label={labels.Transfer} icon={<TrendingFlat />} href="/accounts/transfer" />
      <BottomNavigationAction value="Invoices" label={labels.Invoices} icon={<Receipt />} href="/invoices" />
    </MuiBottomNavigation>
  );
};
