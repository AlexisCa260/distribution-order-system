import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardOperator from "./pages/operator/DashboardOperator";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta raíz → redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/operator" element={<DashboardOperator />} />

        {/* Ruta no encontrada */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
