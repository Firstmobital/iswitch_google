export type UserRole = 'retailer' | 'admin'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type SchemeStatus = 'draft' | 'published' | 'expired'
export type SwipeType = 'Full Swipe' | 'NCEMI' | 'Full Swipe/NCEMI'
export type FinancePartner = 'Bajaj Finance' | 'IDFC Paper Finance' | 'TVS Credit'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  shop_name: string | null
  phone: string | null
  city: string | null
  role: UserRole
  approval_status: ApprovalStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MobileModel {
  id: string
  name: string
  storage: string
  color_options: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Scheme {
  id: string
  model_id: string
  status: SchemeStatus
  mop: number
  dealer_landing: number | null
  consumer_offer_gst: number
  consumer_offer_note: string | null
  cashback_hdfc_emi: number
  cashback_hdfc_full: number
  min_swipe: number | null
  max_swipe: number | null
  swipe_type: SwipeType
  emi_months: string[]
  valid_from: string
  valid_to: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  mobile_models?: MobileModel
  exchange_offers?: ExchangeOffer[]
  finance_schemes?: FinanceScheme[]
}

export interface ExchangeOffer {
  id: string
  scheme_id: string
  platform: string
  bonus_label: string | null
  tier_3_10k: number
  tier_10_15k: number
  tier_15k_plus: number
  created_at: string
}

export interface FinanceScheme {
  id: string
  scheme_id: string
  partner: FinancePartner
  tenure_options: string
  dealer_charge_pct: number
  notes: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile>
        Update: Partial<Profile>
        Relationships: []
      }
      mobile_models: {
        Row: MobileModel
        Insert: Partial<MobileModel>
        Update: Partial<MobileModel>
        Relationships: []
      }
      schemes: {
        Row: Scheme
        Insert: Partial<Scheme>
        Update: Partial<Scheme>
        Relationships: []
      }
      exchange_offers: {
        Row: ExchangeOffer
        Insert: Partial<ExchangeOffer>
        Update: Partial<ExchangeOffer>
        Relationships: []
      }
      finance_schemes: {
        Row: FinanceScheme
        Insert: Partial<FinanceScheme>
        Update: Partial<FinanceScheme>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
