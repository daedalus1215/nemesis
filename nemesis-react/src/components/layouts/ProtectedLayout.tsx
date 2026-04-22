import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/Navbar";

export const ProtectedLayout: React.FC = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};
