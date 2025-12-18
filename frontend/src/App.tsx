import type {JSX} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {Footer} from "./components/footer/footer";
import { Header } from "./components/header/header";
import Home from "./pages/home/home";
import {Dashboard} from "./pages/dashboard/dashboard";
import {AppLayout} from "./components/layout/AppLayout";
import {Login} from "./pages/login/login";
import { Register } from "./pages/register/register";
import { ThemeProvider } from "./components/themec/themec";
import { DeviceConnect } from "./pages/devcon/devcon";

function ProtectedRoute({ children }: { children: JSX.Element}){
  const user = localStorage.getItem("user");
  const isAuth = !!user;

  if(!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children;
}

function PublicLayout({ children }: { children: JSX.Element }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AppLayoutWrapper() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <AppLayout />
      </div>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />

        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayoutWrapper />
        </ProtectedRoute>
        }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="devices/connect" element={<DeviceConnect />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}
