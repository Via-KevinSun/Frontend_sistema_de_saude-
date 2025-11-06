// src/pages/Login/index.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { login } from "../../utils/auth";
import "./index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await api.post("/usuarios/login", { email, senha });
      const { token, usuario } = response.data;

      login(token, usuario);

      const papel = usuario.papel;
      if (papel === "gestor") navigate("/dashboard/gestor");
      else if (papel === "medico") navigate("/dashboard/medico");
      else if (["agente", "enfermeiro"].includes(papel)) navigate("/dashboard/profissional");
      else navigate("/");
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass">
        <div className="logo">
          <div className="icon">Heart</div>
          <h1>eSaúde Local</h1>
          <p>Sistema Nacional de Saúde</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder=" "
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
            />
            <label>Senha</label>
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-entrar">
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="footer">
          <p>Ministério da Saúde • Moçambique</p>
        </div>
      </div>
    </div>
  );
}

export default Login;