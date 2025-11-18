/**
 * LOT 5 - Financial Aid Types (Updated)
 * Interface definitions for Financial Aid Screen with contacts and CTAs
 */

export interface CTA {
  label: string;
  type: 'link';
  url: string;
  open_mode: 'in_app_webview' | 'external';
}

export interface PhoneContact {
  display: string;
  tel_href: string | null;
  note?: string;
}

export interface Contacts {
  website?: string;
  phone?: PhoneContact;
  email?: string;
}

export interface FinancialAid {
  // Core identifiers
  code: string;
  name: string;
  short_label: string;
  category: string;

  // Descriptions
  who: string;
  description_parent: string;
  territory_scope: string;

  // Actions
  primary_cta: CTA;
  secondary_ctas: CTA[];

  // Contacts
  contacts: Contacts;

  // Legacy fields for backward compatibility
  id?: string;
  title?: string;
  amount?: string;
  age_range?: string;
  type?: string;
  description?: string;
  organizer?: string;
  eligibility_criteria?: {
    is_qpv_required: boolean;
    income_ceiling?: number;
    other_requirements?: string[];
  };
  external_url?: string;
  is_eligible?: boolean;
  check_eligibility_needed?: boolean;
}

export interface AidSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  bg_light: string;
  aids: FinancialAid[];
}
