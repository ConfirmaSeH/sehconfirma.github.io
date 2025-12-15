const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co';
const supabaseKey = 'PEGA_ACÁ_LA_ANON_PUBLIC_KEY';

console.log("JS CARGADO OK");
console.log("URL:", supabaseUrl);
console.log("KEY (20):", supabaseKey.slice(0,20));

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

supabaseClient
  .from('establecimientos')
  .select('nombre')
  .limit(1)
  .then(res => console.log("RESPUESTA SUPABASE:", res));
