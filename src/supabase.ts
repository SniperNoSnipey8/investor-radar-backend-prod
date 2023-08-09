const createClient = require("@supabase/supabase-js").createClient

const supabaseUrl =  process.env["SUPABASE_URL"]

const supabaseAnonKey = process.env['SUPABASE_KEY']

export const supabase = createClient(supabaseUrl, supabaseAnonKey)  