// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import routes from './routes/routes';
import Layout from './components/Layout';
import Login from './pages/Login/index.jsx';

function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/" element={<Login />} />

      {/* Rotas protegidas com Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {routes
          .filter(route => !route.isPublic)
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute allowedRoles={route.roles}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
      </Route>

      <Route path="*" element={<div>Página não encontrada</div>} />
    </Routes>
  );
}

export default App;