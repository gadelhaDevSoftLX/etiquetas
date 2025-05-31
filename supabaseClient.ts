import { createClient } from '@supabase/supabase-js';
import { StoredLabelData } from './types'; // Ensure StoredLabelData matches your table structure

// ######################################################################
// ## IMPORTANTE: COLOQUE SUAS CREDENCIAIS REAIS DO SUPABASE ABAIXO:  ##
// ######################################################################

// Substitua pela URL da API do seu projeto Supabase (ex: https://xyz.supabase.co)
const supabaseUrl = "https://tyagljplynvqzxdltxzf.supabase.co";

// Substitua pela Chave Anônima (Anon Key) pública do seu projeto Supabase
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWdsanBseW52cXp4ZGx0eHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NjY2NzQsImV4cCI6MjA2NDE0MjY3NH0.YQeQOetCmruQ4eiRZRnqzER6wKMzsLGmVQVXwG1lPhw";

// ######################################################################

let supabaseInstance = null;

if (!supabaseUrl || supabaseUrl === "COLE_AQUI_A_URL_DA_API_DO_SEU_PROJETO_SUPABASE" || !supabaseAnonKey || supabaseAnonKey === "COLE_AQUI_A_SUA_CHAVE_ANON_PUBLICA_SUPABASE") {
  console.warn(
    'Supabase URL ou Anon Key não estão definidas corretamente em supabaseClient.ts. ' +
    'A integração com Supabase estará desabilitada. ' +
    'Por favor, insira suas credenciais reais nos locais indicados no arquivo.'
  );
} else {
  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Falha ao inicializar o cliente Supabase:", error);
    console.warn("A integração com Supabase estará desabilitada devido a um erro na inicialização.");
  }
}

export const supabase = supabaseInstance;

// Define a type for your database schema if you want strong typing with Supabase
// This is a basic example; you should tailor it to your actual Supabase table structure.
export interface Database {
  public: {
    Tables: {
      generated_labels: { // Ensure this matches your table name
        Row: StoredLabelData; // Interface for data retrieved from the table
        Insert: StoredLabelData; // Interface for data to be inserted
        Update: Partial<StoredLabelData>; // Interface for data to be updated
      };
      // ... any other tables
    };
    Views: {
      // ... any views
    };
    Functions: {
      // ... any functions
    };
  };
}