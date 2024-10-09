import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.3.0/dist/module/index.js'; // Cambia la versión según sea necesario


// Obtén las variables de entorno correctamente
const supabaseUrl = "https://ikwtencuskgbkboyhizz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrd3RlbmN1c2tnYmtib3loaXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyODU3MDMsImV4cCI6MjA0Mjg2MTcwM30.xOcCkWyfUnn_SLv2lFoLAQ2AZuW1vJVpmD3vFUN9k2g";
console.log(supabaseUrl, supabaseKey); // Logging para depuración

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log("Function started"); // Logging para depuración

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const currentDate = new Date().toISOString();
  
  return new Response(JSON.stringify({ currentDate }), { status: 200 });
});
