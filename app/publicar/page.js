'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { criarClienteNavegador } from '@/lib/supabase/client';

const CATEGORIAS = ['Veículos', 'Imóveis', 'Eletrônicos', 'Casa e móveis', 'Agro e ferramentas', 'Serviços', 'Outros'];

export default function Publicar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(undefined);
  const [arquivos, setArquivos] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const supabase = criarClienteNavegador();
    supabase.auth.getUser().then(({ data }) => setUsuario(data.user ?? null));
  }, []);

  if (usuario === undefined) return <p className="subtitulo">Carregando…</p>;

  if (usuario === null) {
    return (
      <div className="formulario">
        <h1>Publicar anúncio</h1>
        <p className="aviso">Você precisa entrar para publicar. As fotos ficam guardadas na sua pasta.</p>
        <a className="botao" href="/entrar">Entrar</a>
      </div>
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    const supabase = criarClienteNavegador();
    const form = new FormData(e.target);

    const { data: anuncio, error: erroAnuncio } = await supabase
      .from('anuncios')
      .insert({
        user_id: usuario.id,
        titulo: form.get('titulo'),
        descricao: form.get('descricao'),
        preco: form.get('preco') ? Number(form.get('preco')) : null,
        categoria: form.get('categoria'),
        cidade: form.get('cidade'),
        uf: form.get('uf'),
        contato_whatsapp: form.get('whatsapp'),
        status: 'pendente',
      })
      .select('id')
      .single();

    if (erroAnuncio) {
      setErro(erroAnuncio.message);
      setSalvando(false);
      return;
    }

    for (const [indice, arquivo] of arquivos.entries()) {
      const extensao = arquivo.name.split('.').pop().toLowerCase();
      const caminho = `${usuario.id}/${anuncio.id}/${Date.now()}-${indice}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from('fotos')
        .upload(caminho, arquivo, { contentType: arquivo.type });

      if (erroUpload) {
        setErro(`Anúncio criado, mas uma foto falhou: ${erroUpload.message}`);
        setSalvando(false);
        return;
      }

      await supabase.from('anuncio_fotos').insert({
        anuncio_id: anuncio.id,
        path: caminho,
        ordem: indice,
      });
    }

    router.push('/meus-anuncios');
    router.refresh();
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div>
        <h1>Publicar anúncio</h1>
        <p className="subtitulo" style={{ margin: 0 }}>
          Ele entra como <strong>pendente</strong> e aparece no site depois da aprovação.
        </p>
      </div>

      <div>
        <label htmlFor="titulo">Título</label>
        <input id="titulo" name="titulo" required maxLength={120} placeholder="Ex.: Fusca 1978 restaurado" />
      </div>

      <div className="linha">
        <div>
          <label htmlFor="preco">Preço (R$)</label>
          <input id="preco" name="preco" type="number" step="0.01" min="0" placeholder="Deixe vazio para 'a combinar'" />
        </div>
        <div>
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" name="categoria" defaultValue="Outros">
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="linha">
        <div>
          <label htmlFor="cidade">Cidade</label>
          <input id="cidade" name="cidade" placeholder="Paracatu" />
        </div>
        <div>
          <label htmlFor="uf">UF</label>
          <input id="uf" name="uf" maxLength={2} placeholder="MG" />
        </div>
      </div>

      <div>
        <label htmlFor="whatsapp">WhatsApp para contato</label>
        <input id="whatsapp" name="whatsapp" placeholder="(38) 90000-0000" />
      </div>

      <div>
        <label htmlFor="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" placeholder="Estado, tempo de uso, o que acompanha…" />
      </div>

      <div>
        <label htmlFor="fotos">Fotos (até 5 MB cada, só imagens)</label>
        <input
          id="fotos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={(e) => setArquivos([...e.target.files].slice(0, 8))}
        />
      </div>

      {erro && <p className="aviso">{erro}</p>}

      <div>
        <button className="botao" disabled={salvando}>
          {salvando ? 'Publicando…' : 'Publicar anúncio'}
        </button>
      </div>
    </form>
  );
}
