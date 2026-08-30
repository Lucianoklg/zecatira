export function formatarPreco(valor) {
  if (valor === null || valor === undefined) return 'A combinar';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export function urlDaFoto(supabaseUrl, path) {
  return `${supabaseUrl}/storage/v1/object/public/fotos/${path}`;
}
