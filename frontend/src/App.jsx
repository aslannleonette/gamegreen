import { useMemo, useState } from 'react';
import { request } from './services/api';

const initialAuth = JSON.parse(localStorage.getItem('gg_auth') || 'null');

function App() {
  const [auth, setAuth] = useState(initialAuth);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [dashboard, setDashboard] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [pending, setPending] = useState([]);
  const [delivery, setDelivery] = useState({ material: 'PET', weightKg: 1 });
  const [msg, setMsg] = useState('');

  const headers = useMemo(
    () => ({ Authorization: auth ? `Bearer ${auth.token}` : '' }),
    [auth],
  );

  const saveAuth = (data) => {
    localStorage.setItem('gg_auth', JSON.stringify(data));
    setAuth(data);
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      saveAuth(data);
      setMsg('Autenticado com sucesso!');
    } catch (error) {
      setMsg(error.message);
    }
  };

  const loadUserData = async () => {
    try {
      const [dash, rw] = await Promise.all([
        request('/dashboard/me', { headers }),
        request('/rewards', { headers }),
      ]);
      setDashboard(dash);
      setRewards(rw);
    } catch (error) {
      setMsg(error.message);
    }
  };

  const loadPartnerData = async () => {
    try {
      const data = await request('/partner/deliveries/pending', { headers });
      setPending(data);
    } catch (error) {
      setMsg(error.message);
    }
  };

  const createDelivery = async () => {
    try {
      await request('/deliveries', { method: 'POST', headers, body: JSON.stringify(delivery) });
      setMsg('Entrega registrada!');
      loadUserData();
    } catch (error) {
      setMsg(error.message);
    }
  };

  const review = async (id, status) => {
    try {
      await request(`/partner/deliveries/${id}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      setMsg(`Entrega ${status}.`);
      loadPartnerData();
    } catch (error) {
      setMsg(error.message);
    }
  };

  const redeem = async (id) => {
    try {
      await request(`/rewards/${id}/redeem`, { method: 'POST', headers });
      setMsg('Recompensa resgatada!');
      loadUserData();
    } catch (error) {
      setMsg(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('gg_auth');
    setAuth(null);
    setDashboard(null);
    setPending([]);
  };

  if (!auth) {
    return (
      <main className="container">
        <section className="panel">
          <h1>🎮 Game Green</h1>
          <p>Gamificação ambiental com pontos por reciclagem.</p>
          <div className="tabs">
            <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>Login</button>
            <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>Cadastro</button>
          </div>
          <form onSubmit={submitAuth}>
            {mode === 'register' && (
              <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            )}
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {mode === 'register' && (
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">Usuário</option>
                <option value="partner">Parceiro</option>
              </select>
            )}
            <button type="submit">Entrar</button>
          </form>
          {msg && <p className="msg">{msg}</p>}
        </section>
      </main>
    );
  }

  const isPartner = auth.user.role === 'partner';

  return (
    <main className="container">
      <section className="panel full">
        <header className="header">
          <h1>🎮 Game Green</h1>
          <div>
            <span>{auth.user.name} ({auth.user.role})</span>
            <button onClick={logout}>Sair</button>
          </div>
        </header>

        {!isPartner ? (
          <>
            <button onClick={loadUserData}>Atualizar Dashboard</button>
            <div className="grid">
              <div className="card">
                <h3>Nova entrega</h3>
                <select value={delivery.material} onChange={(e) => setDelivery({ ...delivery, material: e.target.value })}>
                  <option>PET</option><option>Aluminio</option><option>Papel</option><option>Vidro</option>
                </select>
                <input type="number" step="0.1" value={delivery.weightKg} onChange={(e) => setDelivery({ ...delivery, weightKg: Number(e.target.value) })} />
                <button onClick={createDelivery}>Registrar</button>
              </div>

              <div className="card">
                <h3>Pontos totais</h3>
                <p className="score">{dashboard?.user?.points_balance ?? 0}</p>
              </div>

              <div className="card">
                <h3>Ranking</h3>
                <ul>{dashboard?.ranking?.map((r) => <li key={r.name}>{r.name}: {r.points_balance}</li>)}</ul>
              </div>

              <div className="card">
                <h3>Histórico</h3>
                <ul>{dashboard?.history?.map((h) => <li key={h.id}>{h.material} {h.weight_kg}kg - {h.status} ({h.points_calculated}pts)</li>)}</ul>
              </div>

              <div className="card">
                <h3>Recompensas</h3>
                <ul>
                  {rewards.map((r) => (
                    <li key={r.id}>{r.name} - {r.points_required} pts <button onClick={() => redeem(r.id)}>Resgatar</button></li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <button onClick={loadPartnerData}>Carregar pendentes</button>
            <div className="card">
              <h3>Entregas pendentes</h3>
              <ul>
                {pending.map((d) => (
                  <li key={d.id}>
                    {d.user_name} - {d.material} ({d.weight_kg}kg | {d.points_calculated} pts)
                    <button onClick={() => review(d.id, 'aprovado')}>Aprovar</button>
                    <button onClick={() => review(d.id, 'rejeitado')}>Rejeitar</button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {msg && <p className="msg">{msg}</p>}
      </section>
    </main>
  );
}

export default App;
