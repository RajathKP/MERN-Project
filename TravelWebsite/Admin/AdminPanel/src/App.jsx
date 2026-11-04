
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import AdminDashboard from "./adminPanel.jsx";
import Destinations from "./DestnationsAdmin.jsx";

const NotFound = () => (
  <div style={{ padding: "3rem", textAlign: "center" }}>
    <h1>404</h1>
    <p>The page you are looking for does not exist.</p>

    <Link to="/admin">Go to dashboard</Link>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home -> Admin Dashboard */}
        <Route
          path="/"
          element={<Navigate to="/admin" replace />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* Tour Packages */}
        <Route
          path="/admin/tours"
          element={
            <Navigate
              to="/admin?tab=tours"
              replace
            />
          }
        />

        {/* Add Tour */}
        <Route
          path="/admin/add"
          element={
            <Navigate
              to="/admin?tab=add"
              replace
            />
          }
        />

        {/* Public Destinations */}
        <Route
          path="/destinations"
          element={<Destinations />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
