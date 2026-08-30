import { NextResponse } from 'next/server';
import { criarClienteServidor } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const proximo = searchParams.get('next') ?? '/meus-anuncios';

  if (code) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${proximo}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link-invalido`);
}
