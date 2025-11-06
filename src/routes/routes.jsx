// src/routes/routes.js
import Login from '../pages/Login/index.jsx';
import DashboardGestor from '../pages/DashboardGestor/index.jsx';
import DashboardMedico from '../pages/DashboardMedico/index.jsx'; // FALTAVA!
import DashboardProfissional from '../pages/DashboardProfissional/index.jsx';
import Usuarios from '../pages/Usuarios/index.jsx';
import Utentes from '../pages/Utentes/index.jsx';
import Triagem from '../pages/Triagem/index.jsx';

import Consultas from '../pages/Consultas/index.jsx';
import CriarPrescricao from '../pages/CriarPrescricao/index.jsx';
import RegistrarLeitura from '../pages/RegistrarLeitura/index.jsx';
import Relatorio from '../pages/Relatorio/index.jsx';

import Zonas from '../pages/Zonas/index.jsx';


const routes = [
  { path: '/', element: <Login />, isPublic: true },
  { path: '/dashboard/gestor', element: <DashboardGestor />, roles: ['gestor'] },
  { path: '/dashboard/medico', element: <DashboardMedico />, roles: ['medico'] }, // AGORA FUNCIONA
  { path: '/dashboard/profissional', element: <DashboardProfissional />, roles: ['agente', 'enfermeiro'] },
  { path: '/usuarios', element: <Usuarios />, roles: ['gestor'] },
  { path: '/utentes', element: <Utentes />, roles: ['gestor', 'medico', 'enfermeiro', 'agente'] },
  { path: '/triagens', element: <Triagem />, roles: ['gestor', 'medico', 'enfermeiro', 'agente'] },
  
  { path: '/consultas', element: <Consultas />, roles: ['gestor', 'medico', 'enfermeiro', 'agente'] },
  { path: '/prescricoes', element: <CriarPrescricao />, roles: ['medico'] },
  { path: '/leituras-clinicas', element: <RegistrarLeitura />, roles: ['gestor', 'medico', 'enfermeiro', 'agente'] },
  { path: '/relatorios', element: <Relatorio />, roles: ['gestor'] },
  { path: '/zonas', element: <Zonas />, roles: ['gestor'] }
  
];

export default routes;