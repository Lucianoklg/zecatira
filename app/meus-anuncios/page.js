import Link from 'next/link';
import { redirect } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';
import { formatarPreco, urlDaFoto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

const ROTULOS = {
  rascunho: 'Rascunho',
  pendente: 'Aguardando aprovação',
  publicado: 'Publicado',
  vendido: 'Vendido',
  recusado: 'Recusado',
};

export default async function MeusAnuncios() {
  const supabase = await criarClienteServidor();
  const { data: sessao } = await supabase.auth.getUser();

  if (!sessao?.user) redirect('/entrar');

  const { data: anuncios } = await supabase
    .from('anuncios')
    .select('id, titulo, preco, status, criado_em, anuncio_fotos ( path, ordem )')
    .eq('user_id', sessao.user.id)
    .order('criado_em', { ascending: false });

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div>
          <h1>Meus anúncios</h1>
          <p className="subtitulo">Entrou como {sessao.user.email}</p>
        </div>
        <form action="/sair" method="post">
          <button className="botao botao-secundario">Sair</button>
        </form>
      </div>

      {(!anuncios || anuncios.length === 0) ? (
        <div className="vazio">
          Você ainda não publicou nada.{' '}
          <Link href="/publicar" style={{ color: 'var(--destaque)', fontWeight: 600 }}>Publicar agora</Link>.
        </div>
      ) : (
        <div className="grade">
          {anuncios.map((a) => {
            const foto = [...(a.anuncio_fotos ?? [])].sort((x, y) => x.ordem - y.ordem)[0];
            return (
              <Link key={a.id} href={`/anuncio/${a.id}`} className="cartao">
                {foto ? (
                  <img className="cartao-foto" src={urlDaFoto(process.env.NEXT_PUBLIC_SUPABASE_URL, foto.path)} alt={a.titulo} />
                ) : (
                  <div className="cartao-foto" />
                )}
                <div className="cartao-corpo">
                  <p className="cartao-titulo">{a.titulo}</p>
                  <p className="cartao-preco">{formatarPreco(a.preco)}</p>
                  <p className="cartao-local">{ROTULOS[a.status] ?? a.status}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
