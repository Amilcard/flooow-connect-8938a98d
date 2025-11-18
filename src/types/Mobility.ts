/**
 * Eco-Mobility Types
 * Interface definitions for Mobility Solutions with contacts and CTAs
 */

export interface CTA {
  label: string;
  type: 'link';
  url: string;
  open_mode: 'in_app_webview' | 'external_tab';
}

export interface PhoneContact {
  display: string;
  tel_href: string | null;
  note?: string;
}

export interface Contacts {
  website?: string;
  phone?: PhoneContact | null;
  email?: string | null;
}

export type TransportMode =
  | 'tram'
  | 'bus'
  | 'trolleybus'
  | 'velo_libre_service'
  | 'covoiturage'
  | 'autopartage'
  | 'train'
  | 'taxi'
  | 'infos_transports'
  | 'infos_ville'
  | 'information_CO2';

export interface MobilitySolution {
  code: string;
  name: string;
  short_label: string;
  modes: TransportMode[];
  description_parent: string;
  territory_scope: string;
  primary_cta: CTA;
  secondary_ctas: CTA[];
  contacts: Contacts;
}

export interface DataSource {
  code: string;
  label: string;
  description_parent: string;
  website: string;
}
