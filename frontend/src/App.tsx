import type {JSX} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Footer from "./components/footer/footer";
import Home from "./pages/home/home";

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
      </Routes>
    </BrowserRouter>
  );
}
