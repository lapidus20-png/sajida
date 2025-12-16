import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
  throw new Error('Supabase configuration is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'builderhub-auth',
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'builderhub-app'
    }
  }
});

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
}

export interface User {
  id: string;
  user_type: 'client' | 'artisan' | 'admin';
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  created_at: string;
  updated_at: string;
}

export interface Artisan {
  id: string;
  user_id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  ville: string;
  quartier: string;
  adresse: string;
  metier: string[] | string;
  description: string;
  photo_url: string;
  annees_experience: number;
  tarif_horaire: number;
  disponible: boolean;
  note_moyenne: number;
  statut_verification: 'en_attente' | 'verifie' | 'rejete';
  portefeuille: string[];
  certifications: string[];
  assurance_rcpro: boolean;
  date_naissance?: string;
  genre?: 'homme' | 'femme' | 'autre' | '';
  photo_id_url?: string;
  photo_id_verified?: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface JobRequest {
  id: string;
  client_id: string;
  titre: string;
  description: string;
  categorie: string;
  localisation: string;
  ville: string;
  budget: number;
  date_souhaitee: string | null;
  date_limite_devis: string | null;
  statut: 'publiee' | 'en_negociation' | 'attribuee' | 'en_cours' | 'terminee' | 'annulee';
  images_url: string[];
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  job_request_id: string;
  artisan_id: string;
  montant_total: number;
  montant_acompte: number;
  delai_execution: number;
  description_travaux: string;
  materiel_fourni: string[];
  conditions_paiement: string;
  statut: 'en_attente' | 'accepte' | 'refuse' | 'expire';
  validite_jusqu_au: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  job_request_id: string;
  quote_id: string;
  client_id: string;
  artisan_id: string;
  montant_total: number;
  acompte: number;
  reste_du: number;
  date_debut: string;
  date_fin_prevue: string;
  conditions_generales: string;
  signe_client: boolean;
  signe_artisan: boolean;
  date_signature_client: string | null;
  date_signature_artisan: string | null;
  statut: 'en_cours' | 'termine' | 'resilie';
  created_at: string;
  updated_at: string;
}

export interface ProjectTimeline {
  id: string;
  contract_id: string;
  jalon_numero: number;
  titre: string;
  description: string;
  date_prevue: string;
  date_completion: string | null;
  pourcentage_travail: number;
  montant_associe: number;
  statut: 'en_attente' | 'en_cours' | 'complete' | 'repousse';
  photos_url: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  job_request_id: string | null;
  quote_id: string | null;
  sender_id: string;
  recipient_id: string;
  contenu: string;
  pieces_jointes: string[];
  lu: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: 'mobile_money' | 'bank_card' | 'cash';
  provider: 'orange_money' | 'moov_money' | 'wave' | 'telecel_money' | 'visa' | 'mastercard' | 'cash';
  display_name: string;
  last_four?: string;
  phone_number?: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  contract_id?: string;
  payer_id: string;
  receiver_id: string;
  payment_method_id?: string;
  amount: number;
  transaction_type: 'acompte' | 'paiement_partiel' | 'solde' | 'remboursement';
  status: 'en_attente' | 'traitement' | 'complete' | 'echoue' | 'annule' | 'rembourse';
  provider_transaction_id?: string;
  provider_reference?: string;
  failure_reason?: string;
  metadata: Record<string, any>;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EscrowAccount {
  id: string;
  contract_id: string;
  total_amount: number;
  amount_deposited: number;
  amount_released: number;
  amount_held: number;
  status: 'ouvert' | 'finance' | 'en_cours' | 'termine' | 'dispute' | 'cloture';
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  contract_id: string;
  milestone_number: number;
  description: string;
  amount: number;
  due_date?: string;
  status: 'en_attente' | 'paye' | 'en_retard' | 'annule';
  paid_at?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  note: number;
  commentaire: string;
  verification_code: string | null;
  verified: boolean;
  utile_count: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  artisan_id: string;
  client_nom: string;
  client_telephone: string;
  description: string;
  adresse: string;
  date_souhaitee: string;
  statut: 'en_attente' | 'accepte' | 'en_cours' | 'termine' | 'annule';
  budget_estime: number;
  created_at: string;
  updated_at: string;
}

export interface Avis {
  id: string;
  artisan_id: string;
  service_id: string | null;
  client_nom: string;
  note: number;
  commentaire: string;
  created_at: string;
}

// Helper functions for privacy
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 4) return '***';
  return phone.substring(0, 4) + 'X'.repeat(Math.max(0, phone.length - 6)) + phone.substring(phone.length - 2);
}

export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return local[0] + '***@' + domain[0] + '***.' + domain.split('.').pop();
  }
  return local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] + '@' + domain[0] + '***.' + domain.split('.').pop();
}

export async function canViewContactInfo(
  viewerId: string,
  targetUserId: string,
  contractId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_view_contact_info', {
    viewer_id: viewerId,
    target_user_id: targetUserId,
    contract_id_param: contractId || null,
  });

  if (error) {
    console.error('Error checking contact permissions:', error);
    return false;
  }

  return data === true;
}
