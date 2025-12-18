import type {JSX} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
//import Footer from "./components/footer/footer";
import Home from "./pages/home/home";
import {Dashboard} from "./pages/dashboard/dashboard";
import {AppLayout} from "./components/layout/AppLayout";
import {Login} from "./pages/login/login";

function ProtectedRoute({ children }: { children: JSX.Element}){
  const user = localStorage.getItem("user");
  const isAuth = !!user;

  if(!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
        </ProtectedRoute>
        }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
