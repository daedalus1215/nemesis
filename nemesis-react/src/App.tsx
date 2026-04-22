import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/LoginPage/LoginPage";

import { useAuth } from "./auth/useAuth";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { AuthProvider } from "./auth/AuthContext";
import { HomePage } from "./pages/HomePage/HomePage";
import { MoneyPage } from "./pages/MoneyPage/MoneyPage";
import { AccountsListPage } from "./pages/AccountsListPage/AccountsListPage";
import { CreateAccountPage } from "./pages/CreateAccountPage/CreateAccountPage";
import { AccountTransferPage } from "./pages/AccountTransferPage/AccountTransferPage";
import { AccountDetailPage } from "./pages/AccountDetailPage/AccountDetailPage";
import { SendInvoicePage } from "./pages/SendInvoicePage/SendInvoicePage";
import { InvoicePage } from "./pages/InvoiceListPage/InvoiceListPage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage/InvoiceDetailPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <Routes>
          {/* <header>
        <Navbar />
      </header> */}
          <Route path="/" element={<HomePage />} />
          <Route path="/money" element={<MoneyPage />} />
          <Route path="/accounts" element={<AccountsListPage />} />
          <Route path="/accounts/detail/:accountId" element={<AccountDetailPage />} />
          <Route path="/accounts/create" element={<CreateAccountPage />} />
          <Route path="/accounts/transfer" element={<AccountTransferPage />} />
          <Route path="/invoices" element={<InvoicePage />} />
          <Route path="/invoices/send" element={<SendInvoicePage />} />
          <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
        </Routes>
      </>
    );
  }

  return (
    <Routes>
      {/* <header>
        <Navbar />
      </header> */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Redirect unauthenticated users trying to access protected pages */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider >
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
