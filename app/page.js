import Link from 'next/link';
import { criarClienteServidor } from '@/lib/supabase/server';
import { formatarPreco, urlDaFoto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await criarClienteServidor();

  const { data: anuncios, error } = await supabase
    .from('anuncios')
    .select('id, titulo, preco, cidade, uf, anuncio_fotos ( path, ordem )')
    .eq('status', 'publicado')
    .order('criado_em', { ascending: false })
    .limit(48);

  if (error) {
    return <p className="aviso">Não consegui carregar os anúncios: {error.message}</p>;
  }

  return (
    <>
      <h1>Anúncios</h1>
      <p className="subtitulo">O que está à venda por aqui agora.</p>

      {anuncios.length === 0 ? (
        <div className="vazio">
          Ainda não há anúncios publicados.{' '}
          <Link href="/publicar" style={{ color: 'var(--destaque)', fontWeight: 600 }}>
            Publique o primeiro
          </Link>.
        </div>
      ) : (
        <div className="grade">
          {anuncios.map((a) => {
            const foto = [...(a.anuncio_fotos ?? [])].sort((x, y) => x.ordem - y.ordem)[0];
            return (
              <Link key={a.id} href={`/anuncio/${a.id}`} className="cartao">
                {foto ? (
                  <img
                    className="cartao-foto"
                    src={urlDaFoto(process.env.NEXT_PUBLIC_SUPABASE_URL, foto.path)}
                    alt={a.titulo}
                  />
                ) : (
                  <div className="cartao-foto" />
                )}
                <div className="cartao-corpo">
                  <p className="cartao-titulo">{a.titulo}</p>
                  <p className="cartao-preco">{formatarPreco(a.preco)}</p>
                  {(a.cidade || a.uf) && (
                    <p className="cartao-local">{[a.cidade, a.uf].filter(Boolean).join(' — ')}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
