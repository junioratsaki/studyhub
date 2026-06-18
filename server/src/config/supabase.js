const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Client Admin : Accès total, bypass RLS (Utilisé par le backend pour les actions privilégiées)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Client Public : Respecte les politiques RLS (Utilisé pour les requêtes standards)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

module.exports = {
  supabaseAdmin,
  supabaseClient,
};
