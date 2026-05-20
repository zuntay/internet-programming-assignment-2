import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Study from "./pages/Study.jsx";
import AdminHistory from "./pages/AdminHistory.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function NoMatch() {
  return (
    <main className="page">
      <section className="panel">
        <h1>404</h1>
        <p>This page does not exist.</p>
      </section>
    </main>
  );
}

export default function App() {
  const { loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <main className="page">
        <section className="panel">
          <p>Loading...</p>
        </section>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <Study />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/history"
          element={
            <AdminRoute>
              <AdminHistory />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NoMatch />} />
      </Routes>
    </>
  );
}