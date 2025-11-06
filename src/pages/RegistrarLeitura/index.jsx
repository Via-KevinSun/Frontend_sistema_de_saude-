// src/pages/RegistrarLeitura/index.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./index.css"; // vamos criar o CSS logo abaixo

function RegistrarLeitura() {
  const navigate = useNavigate();

  const [utentes, setUtentes] = useState([]);
  const [buscaContacto, setBuscaContacto] = useState("");
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);

  const [form, setForm] = useState({
    tipo: "pressao_arterial",
    valor: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // CARREGAR TODOS OS UTENTES
  useEffect(() => {
    const carregarUtentes = async () => {
      try {
        const res = await api.get("/utentes");
        setUtentes(res.data);
      } catch (err) {
        setErro("Erro ao carregar utentes");
      }
    };
    carregarUtentes();
  }, []);

  // FILTRAR UTENTES PELO CONTACTO
  const utentesFiltrados = utentes.filter((u) =>
    u.contacto?.includes(buscaContacto)
  );

  const selecionarUtente = (utente) => {
    setUtenteSelecionado(utente);
    setBuscaContacto("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utenteSelecionado) {
      setErro("Selecione um utente primeiro");
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      await api.post("/leituras-clinicas", {
        utenteId: utenteSelecionado.id,
        tipo: form.tipo,
        valor: parseFloat(form.valor) || form.valor, // aceita 120/80 ou número
        inseridoPor: JSON.parse(localStorage.getItem("usuario") || "{}").id || null,
      });

      setSucesso("Leitura clínica registrada com sucesso!");
      setForm({ tipo: "pressao_arterial", valor: "" });
      setUtenteSelecionado(null);
      setTimeout(() => setSucesso(""), 3000);
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao registrar leitura");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrar-leitura-container">
      <h1>Registrar Leitura Clínica</h1>

      {/* BUSCA DE UTENTE */}
      <div className="busca-utente">
        <input
          type="text"
          placeholder="Buscar utente por contacto..."
          value={buscaContacto}
          onChange={(e) => setBuscaContacto(e.target.value)}
        />
        {buscaContacto && utentesFiltrados.length > 0 && (
          <div className="resultados-busca">
            {utentesFiltrados.map((u) => (
              <div
                key={u.id}
                className="item-utente"
                onClick={() => selecionarUtente(u)}
              >
                <strong>{u.nome}</strong> - {u.contacto}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UTENTE SELECIONADO */}
      {utenteSelecionado && (
        <div className="utente-selecionado">
          <strong>Paciente:</strong> {utenteSelecionado.nome} ({utenteSelecionado.contacto})
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="leitura-form">
        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          required
        >
          <option value="pressao_arterial">Pressão Arterial (ex: 120/80)</option>
          <option value="glicemia">Glicemia (mg/dL)</option>
          <option value="peso">Peso (kg)</option>
          <option value="temperatura">Temperatura (°C)</option>
          <option value="saturacao">Saturação O₂ (%)</option>
        </select>

        <input
          type="text"
          placeholder={
            form.tipo === "pressao_arterial"
              ? "ex: 120/80"
              : form.tipo === "peso"
              ? "ex: 68.5"
              : "ex: 95"
          }
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          required
        />

        <div className="acoes">
          <button type="submit" disabled={loading || !utenteSelecionado}>
            {loading ? "Registrando..." : "Registrar Leitura"}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </form>

      {/* ALERTAS */}
      {sucesso && <div className="alerta sucesso">{sucesso}</div>}
      {erro && <div className="alerta erro">{erro}</div>}
    </div>
  );
}

export default RegistrarLeitura;