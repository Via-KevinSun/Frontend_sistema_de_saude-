// src/pages/DashboardGestor/index.jsx
import { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import api from "../../services/api";
import "./index.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function DashboardGestor() {
  const [stats, setStats] = useState({
    utentes: 0,
    consultasHoje: 0,
    triagensHoje: 0,
    medicos: 0,
  });
  const [consultasSemana, setConsultasSemana] = useState([]);
  const [triagensZona, setTriagensZona] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          resUtentes,
          resConsultasHoje,
          resTriagensHoje,
          resMedicos,
          resEstatisticas,
          resTriagensZona,
        ] = await Promise.all([
          api.get("/dashboard/utentes/total"),
          api.get("/dashboard/consultas/hoje"),
          api.get("/dashboard/triagens/hoje"),
          api.get("/dashboard/usuarios/medicos"),
          api.get("/dashboard/consultas/estatisticas"),
          api.get("/dashboard/triagens/por-zona"),
        ]);

        setStats({
          utentes: resUtentes.data.total,
          consultasHoje: resConsultasHoje.data.consultas?.length || 0, // CORRIGIDO
          triagensHoje: resTriagensHoje.data.total || 0, // CORRIGIDO
          medicos: resMedicos.data.total || 0,
        });

        setConsultasSemana(resEstatisticas.data || []);
        setTriagensZona(resTriagensZona.data || []);
      } catch (err) {
        setError("Erro ao carregar dados do dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConsultas = {
    labels: consultasSemana.map((c) =>
      new Date(c.data).toLocaleDateString("pt-MZ")
    ),
    datasets: [
      {
        label: "Consultas",
        data: consultasSemana.map((c) => c.total),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartTriagens = {
    labels: triagensZona.map((t) => t.zona),
    datasets: [
      {
        label: "Triagens",
        data: triagensZona.map((t) => t.total),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  if (loading)
    return <div className="dashboard-loading">Carregando dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-gestor">
      <h1>Dashboard do Gestor</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Utentes Cadastrados</h3>
          <p className="stat-number">{stats.utentes}</p>
        </div>
        <div className="stat-card">
          <h3>Consultas Hoje</h3>
          <p className="stat-number">{stats.consultasHoje}</p>
        </div>
        <div className="stat-card">
          <h3>Triagens Hoje</h3>
          <p className="stat-number">{stats.triagensHoje}</p>
        </div>
        <div className="stat-card">
          <h3>Médicos Ativos</h3>
          <p className="stat-number">{stats.medicos}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Consultas nos Últimos 7 Dias</h3>
          <Bar
            data={chartConsultas}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Triagens por Zona</h3>
          <Doughnut data={chartTriagens} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}

export default DashboardGestor;
