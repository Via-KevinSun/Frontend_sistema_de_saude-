// src/pages/Relatorio/index.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./index.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Relatorio() {
  const [zonas, setZonas] = useState([]);
  const [form, setForm] = useState({
    zonaId: "",
    periodoInicio: "",
    periodoFim: "",
  });
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // CARREGAR ZONAS
  useEffect(() => {
    const carregarZonas = async () => {
      try {
        const res = await api.get("/zonas");
        setZonas(res.data);
      } catch (err) {
        console.error("Erro ao carregar zonas", err);
      }
    };
    carregarZonas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    setDados(null);

    try {
      const response = await api.post("/relatorios/vigilancia", {
        zonaId: form.zonaId || null,
        periodoInicio: form.periodoInicio,
        periodoFim: form.periodoFim,
      });
      setDados(response.data);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao gerar relatório");
    } finally {
      setCarregando(false);
    }
  };

  // EXPORTAR PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    const hoje = new Date().toLocaleDateString("pt-MZ");

    doc.setFontSize(16);
    doc.text("RELATÓRIO EPIDEMIOLÓGICO", 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Período: ${form.periodoInicio} a ${form.periodoFim}`, 105, 25, { align: "center" });
    doc.text(`Gerado em: ${hoje}`, 105, 32, { align: "center" });

    if (dados.zona) {
      doc.text(`Zona: ${dados.zona.nome}`, 20, 45);
    }

    // Tabela de Triagens
    const tabelaTriagens = dados.triagensPorResultado.map((item) => [
      item.resultado,
      item.total,
    ]);

    doc.autoTable({
      head: [["Resultado", "Total"]],
      body: tabelaTriagens,
      startY: 55,
    });

    // Tabela de Sintomas
    const tabelaSintomas = dados.sintomasMaisComuns.map((s) => [s.sintoma, s.total]);
    doc.autoTable({
      head: [["Sintoma Mais Comum", "Casos"]],
      body: tabelaSintomas,
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.save(`relatorio_vigilancia_${form.periodoInicio}_a_${form.periodoFim}.pdf`);
  };

  // GRÁFICO
  const chartData = dados
    ? {
        labels: dados.triagensPorResultado.map((t) => t.resultado),
        datasets: [
          {
            label: "Número de Casos",
            data: dados.triagensPorResultado.map((t) => t.total),
            backgroundColor: ["#27ae60", "#f1c40f", "#e74c3c"],
          },
        ],
      }
    : null;

  return (
    <div className="relatorio-container">
      <h1>Relatório Epidemiológico</h1>

      <form onSubmit={handleSubmit} className="relatorio-form">
        <div className="campo">
          <label>Zona (opcional)</label>
          <select
            value={form.zonaId}
            onChange={(e) => setForm({ ...form, zonaId: e.target.value })}
          >
            <option value="">Todas as zonas</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Data Início</label>
          <input
            type="date"
            value={form.periodoInicio}
            onChange={(e) => setForm({ ...form, periodoInicio: e.target.value })}
            required
          />
        </div>

        <div className="campo">
          <label>Data Fim</label>
          <input
            type="date"
            value={form.periodoFim}
            onChange={(e) => setForm({ ...form, periodoFim: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={carregando} className="btn-gerar">
          {carregando ? "Gerando..." : "Gerar Relatório"}
        </button>
      </form>

      {erro && <div className="alerta erro">{erro}</div>}

      {dados && (
        <div className="resultado-relatorio">
          <div className="cabecalho-resultado">
            <h2>Resultados do Período</h2>
            {dados.zona && <p><strong>Zona:</strong> {dados.zona.nome}</p>}
            <button onClick={exportarPDF} className="btn-pdf">
              Exportar PDF
            </button>
          </div>

          <div className="grid-relatorio">
            <div className="card-relatorio">
              <h3>Triagens por Resultado</h3>
              <div className="grafico">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                  }}
                />
              </div>
              <table className="tabela-relatorio">
                <thead>
                  <tr>
                    <th>Resultado</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.triagensPorResultado.map((item) => (
                    <tr key={item.resultado}>
                      <td
                        style={{
                          color:
                            item.resultado === "NORMAL"
                              ? "#27ae60"
                              : item.resultado === "ATENÇÃO"
                              ? "#f1c40f"
                              : "#e74c3c",
                          fontWeight: "bold",
                        }}
                      >
                        {item.resultado}
                      </td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-relatorio">
              <h3>Sintomas Mais Comuns</h3>
              <table className="tabela-relatorio">
                <thead>
                  <tr>
                    <th>Sintoma</th>
                    <th>Casos</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.sintomasMaisComuns.map((s) => (
                    <tr key={s.sintoma}>
                      <td>{s.sintoma}</td>
                      <td>{s.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="resumo-final">
            <p>
              <strong>Total de triagens:</strong> {dados.totalTriagens}
            </p>
            <p>
              <strong>Casos de atenção/urgência:</strong>{" "}
              {dados.triagensPorResultado
                .filter((t) => t.resultado !== "NORMAL")
                .reduce((acc, t) => acc + t.total, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Relatorio;