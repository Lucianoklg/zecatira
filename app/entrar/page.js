'use client';

import { useState } from 'react';
import { criarClienteNavegador } from '@/lib/supabase/client';

export default function Entrar() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState('parado');
  const [erro, setErro] = useState(null);

  async function enviar(e) {
    e.preventDefault();
    setEstado('enviando');
    setErro(null);

    const supabase = criarClienteNavegador();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErro(error.message);
      setEstado('parado');
    } else {
      setEstado('enviado');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="formulario">
        <h1>Confira seu e-mail</h1>
        <p className="subtitulo" style={{ margin: 0 }}>
          Mandei um link de acesso para <strong>{email}</strong>. Abra o link no mesmo navegador.
        </p>
      </div>
    );
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div>
        <h1>Entrar</h1>
        <p className="subtitulo" style={{ margin: 0 }}>
          Sem senha: você recebe um link de acesso por e-mail.
        </p>
      </div>

      <div>
        <label htmlFor="email">Seu e-mail</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com.br"
        />
      </div>

      {erro && <p className="aviso">{erro}</p>}

      <div>
        <button className="botao" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Receber link de acesso'}
        </button>
      </div>
    </form>
  );
}
