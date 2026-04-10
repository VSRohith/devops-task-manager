import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Team from "./Team";

function PrivateRoute({ children }) {
  return localStorage.getItem("user") ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            localStorage.getItem("user") ? <Navigate to="/" /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            localStorage.getItem("user") ? (
              <Navigate to="/" />
            ) : (
              <Login defaultMode="register" />
            )
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/team"
          element={
            <PrivateRoute>
              <Team />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
