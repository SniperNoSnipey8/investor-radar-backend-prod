import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zksjaswexfuqigquugsm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprc2phc3dleGZ1cWlncXV1Z3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM0NDI4MjcsImV4cCI6MTk3OTAxODgyN30.ArGYiz3EWU4MLeqMrSR9QQvvMzAoosmgnoBvMpLiPdw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)