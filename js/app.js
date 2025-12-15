const supabaseUrl = 'https://mmshquwpyxvebkwtrwdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2hxdXdweXh2ZWJrd3Ryd2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTMzMTMsImV4cCI6MjA4MDQ4OTMxM30.ert569xsxnF8VkyfWU-IFNqKoeoMXKLiEkIKm9LLjGc';

console.log("JS CARGADO OK");
console.log("URL:", supabaseUrl);
console.log("KEY (20):", supabaseKey.slice(0,20));

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

supabaseClient
  .from('establecimientos')
  .select('nombre')
  .limit(1)
  .then(res => console.log("RESPUESTA SUPABASE:", res));

