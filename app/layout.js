import './globals.css';
import Link from 'next/link';
import { criarClienteServidor } from '@/lib/supabase/server';

export const metadata = {
  title: 'Zé Catira — classificados',
  description: 'Compre e venda perto de você.',
};

export default async function RootLayout({ children }) {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getUser();
  const usuario = data?.user ?? null;

  return (
    <html lang="pt-BR">
      <body>
        <header className="cabecalho">
          <div className="cabecalho-interno">
            <Link href="/" className="marca">Zé <span>Catira</span></Link>
            <nav className="nav">
              <Link href="/">Anúncios</Link>
              {usuario ? (
                <>
                  <Link href="/meus-anuncios">Meus anúncios</Link>
                  <Link href="/publicar" className="botao">Publicar</Link>
                </>
              ) : (
                <Link href="/entrar" className="botao">Entrar</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="conteudo">{children}</main>
      </body>
    </html>
  );
}
