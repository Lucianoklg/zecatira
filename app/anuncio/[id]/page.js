import { notFound } from 'next/navigation';
import { criarClienteServidor } from '@/lib/supabase/server';
import { formatarPreco, urlDaFoto } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function Anuncio({ params }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const { data: anuncio } = await supabase
    .from('anuncios')
    .select('*, anuncio_fotos ( path, ordem )')
    .eq('id', id)
    .maybeSingle();

  if (!anuncio) notFound();

  const fotos = [...(anuncio.anuncio_fotos ?? [])].sort((a, b) => a.ordem - b.ordem);
  const zap = anuncio.contato_whatsapp?.replace(/\D/g, '');

  return (
    <div className="detalhe">
      <div style={{ display: 'grid', gap: 12 }}>
        {fotos.length > 0 ? (
          fotos.map((f) => (
            <img key={f.path} src={urlDaFoto(process.env.NEXT_PUBLIC_SUPABASE_URL, f.path)} alt={anuncio.titulo} />
          ))
        ) : (
          <div className="vazio">Sem fotos</div>
        )}
      </div>

      <div>
        {anuncio.categoria && <span className="etiqueta">{anuncio.categoria}</span>}
        <h1 style={{ marginTop: 10 }}>{anuncio.titulo}</h1>
        <p className="cartao-preco" style={{ fontSize: 24 }}>{formatarPreco(anuncio.preco)}</p>
        {(anuncio.cidade || anuncio.uf) && (
          <p className="cartao-local">{[anuncio.cidade, anuncio.uf].filter(Boolean).join(' — ')}</p>
        )}
        <p style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>{anuncio.descricao}</p>

        {zap && (
          <p style={{ marginTop: 24 }}>
            <a className="botao" href={`https://wa.me/55${zap}`} target="_blank" rel="noreferrer">
              Chamar no WhatsApp
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
