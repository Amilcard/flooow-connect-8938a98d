export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          last_seen: string
          revoke_reason: string | null
          revoked: boolean | null
          revoked_at: string | null
          revoked_by: string | null
          session_id: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_seen?: string
          revoke_reason?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          session_id: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_seen?: string
          revoke_reason?: string | null
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_by?: string | null
          session_id?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      activities: {
        Row: {
          accepts_aid_types: Json | null
          accessibility_checklist: Json | null
          age_max: number | null
          age_min: number | null
          capacity_policy: Json | null
          categories: string[] | null
          category: string
          covoiturage_enabled: boolean | null
          created_at: string
          description: string | null
          documents_required: Json | null
          external_portal_url: string | null
          id: string
          images: string[] | null
          payment_echelonned: boolean | null
          payment_plans: Json | null
          period_type: string | null
          price_base: number | null
          price_note: string | null
          published: boolean | null
          rules_acceptance_json: Json | null
          structure_id: string
          tags: string[] | null
          title: string
          transport_meta: Json | null
          transport_options: Json | null
          updated_at: string
          vacation_periods: string[] | null
          video_url: string | null
          webhook_url_for_docs: string | null
        }
        Insert: {
          accepts_aid_types?: Json | null
          accessibility_checklist?: Json | null
          age_max?: number | null
          age_min?: number | null
          capacity_policy?: Json | null
          categories?: string[] | null
          category: string
          covoiturage_enabled?: boolean | null
          created_at?: string
          description?: string | null
          documents_required?: Json | null
          external_portal_url?: string | null
          id?: string
          images?: string[] | null
          payment_echelonned?: boolean | null
          payment_plans?: Json | null
          period_type?: string | null
          price_base?: number | null
          price_note?: string | null
          published?: boolean | null
          rules_acceptance_json?: Json | null
          structure_id: string
          tags?: string[] | null
          title: string
          transport_meta?: Json | null
          transport_options?: Json | null
          updated_at?: string
          vacation_periods?: string[] | null
          video_url?: string | null
          webhook_url_for_docs?: string | null
        }
        Update: {
          accepts_aid_types?: Json | null
          accessibility_checklist?: Json | null
          age_max?: number | null
          age_min?: number | null
          capacity_policy?: Json | null
          categories?: string[] | null
          category?: string
          covoiturage_enabled?: boolean | null
          created_at?: string
          description?: string | null
          documents_required?: Json | null
          external_portal_url?: string | null
          id?: string
          images?: string[] | null
          payment_echelonned?: boolean | null
          payment_plans?: Json | null
          period_type?: string | null
          price_base?: number | null
          price_note?: string | null
          published?: boolean | null
          rules_acceptance_json?: Json | null
          structure_id?: string
          tags?: string[] | null
          title?: string
          transport_meta?: Json | null
          transport_options?: Json | null
          updated_at?: string
          vacation_periods?: string[] | null
          video_url?: string | null
          webhook_url_for_docs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "structures"
            referencedColumns: ["id"]
          },
        ]
      }
      aid_simulations: {
        Row: {
          activity_id: string
          booking_id: string | null
          child_id: string | null
          created_at: string
          id: string
          simulated_aids: Json
          user_id: string
        }
        Insert: {
          activity_id: string
          booking_id?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          simulated_aids?: Json
          user_id: string
        }
        Update: {
          activity_id?: string
          booking_id?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          simulated_aids?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aid_simulations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_simulations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_simulations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_simulations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aid_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      aids: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          name: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          activity_id: string
          created_at: string
          day_of_week: number | null
          end: string
          end_date: string | null
          id: string
          price_override: number | null
          recurrence: Json | null
          recurrence_type: string | null
          seats_available: number | null
          seats_remaining: number
          seats_total: number
          start: string
          start_date: string | null
          time_end: string | null
          time_start: string | null
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          day_of_week?: number | null
          end: string
          end_date?: string | null
          id?: string
          price_override?: number | null
          recurrence?: Json | null
          recurrence_type?: string | null
          seats_available?: number | null
          seats_remaining?: number
          seats_total?: number
          start: string
          start_date?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          day_of_week?: number | null
          end?: string
          end_date?: string | null
          id?: string
          price_override?: number | null
          recurrence?: Json | null
          recurrence_type?: string | null
          seats_available?: number | null
          seats_remaining?: number
          seats_total?: number
          start?: string
          start_date?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      bike_stations: {
        Row: {
          available_bikes: number | null
          available_slots: number | null
          id: string
          lat: number
          lon: number
          name: string | null
          raw: Json | null
          source: string
          station_id: string
          updated_at: string | null
        }
        Insert: {
          available_bikes?: number | null
          available_slots?: number | null
          id?: string
          lat: number
          lon: number
          name?: string | null
          raw?: Json | null
          source: string
          station_id: string
          updated_at?: string | null
        }
        Update: {
          available_bikes?: number | null
          available_slots?: number | null
          id?: string
          lat?: number
          lon?: number
          name?: string | null
          raw?: Json | null
          source?: string
          station_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          activity_id: string
          child_id: string
          created_at: string
          express_flag: boolean | null
          history: Json | null
          id: string
          idempotency_key: string | null
          parent_notified_at: string | null
          reason_code: string | null
          requires_parent_validation: boolean | null
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
          transport_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          child_id: string
          created_at?: string
          express_flag?: boolean | null
          history?: Json | null
          id?: string
          idempotency_key?: string | null
          parent_notified_at?: string | null
          reason_code?: string | null
          requires_parent_validation?: boolean | null
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          transport_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          child_id?: string
          created_at?: string
          express_flag?: boolean | null
          history?: Json | null
          id?: string
          idempotency_key?: string | null
          parent_notified_at?: string | null
          reason_code?: string | null
          requires_parent_validation?: boolean | null
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          transport_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "vw_alternative_slots"
            referencedColumns: ["slot_id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          accessibility_flags: Json | null
          created_at: string
          dob: string
          education_level: string | null
          first_name: string
          id: string
          is_student: boolean | null
          needs_json: Json | null
          school_postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_flags?: Json | null
          created_at?: string
          dob: string
          education_level?: string | null
          first_name: string
          id?: string
          is_student?: boolean | null
          needs_json?: Json | null
          school_postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_flags?: Json | null
          created_at?: string
          dob?: string
          education_level?: string | null
          first_name?: string
          id?: string
          is_student?: boolean | null
          needs_json?: Json | null
          school_postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_aids: {
        Row: {
          active: boolean
          age_max: number
          age_min: number
          amount_type: string
          amount_value: number
          categories: string[]
          created_at: string
          cumulative: boolean
          eligibility_summary: string | null
          id: string
          name: string
          official_link: string | null
          qf_max: number | null
          slug: string
          territory_codes: string[]
          territory_level: string
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          active?: boolean
          age_max: number
          age_min: number
          amount_type: string
          amount_value: number
          categories?: string[]
          created_at?: string
          cumulative?: boolean
          eligibility_summary?: string | null
          id?: string
          name: string
          official_link?: string | null
          qf_max?: number | null
          slug: string
          territory_codes?: string[]
          territory_level: string
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          active?: boolean
          age_max?: number
          age_min?: number
          amount_type?: string
          amount_value?: number
          categories?: string[]
          created_at?: string
          cumulative?: boolean
          eligibility_summary?: string | null
          id?: string
          name?: string
          official_link?: string | null
          qf_max?: number | null
          slug?: string
          territory_codes?: string[]
          territory_level?: string
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          backup_codes_hashed: string[] | null
          backup_codes_used: Json | null
          created_at: string
          enforced: boolean | null
          id: string
          mfa_enabled: boolean | null
          mfa_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes_hashed?: string[] | null
          backup_codes_used?: Json | null
          created_at?: string
          enforced?: boolean | null
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes_hashed?: string[] | null
          backup_codes_used?: Json | null
          created_at?: string
          enforced?: boolean | null
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          city_insee: string | null
          created_at: string
          email: string
          id: string
          marital_status: string | null
          postal_code: string | null
          profile_json: Json | null
          quotient_familial: number | null
          rejection_reason: string | null
          territory_id: string | null
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          account_status?: string | null
          city_insee?: string | null
          created_at?: string
          email: string
          id: string
          marital_status?: string | null
          postal_code?: string | null
          profile_json?: Json | null
          quotient_familial?: number | null
          rejection_reason?: string | null
          territory_id?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          account_status?: string | null
          city_insee?: string | null
          created_at?: string
          email?: string
          id?: string
          marital_status?: string | null
          postal_code?: string | null
          profile_json?: Json | null
          quotient_familial?: number | null
          rejection_reason?: string | null
          territory_id?: string | null
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          activity_id: string
          code: string
          created_at: string
          discount_percentage: number
          id: string
          max_usage: number
          updated_at: string
          usage_count: number
          valid_until: string
        }
        Insert: {
          activity_id: string
          code: string
          created_at?: string
          discount_percentage?: number
          id?: string
          max_usage?: number
          updated_at?: string
          usage_count?: number
          valid_until?: string
        }
        Update: {
          activity_id?: string
          code?: string
          created_at?: string
          discount_percentage?: number
          id?: string
          max_usage?: number
          updated_at?: string
          usage_count?: number
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      qpv_reference: {
        Row: {
          code_insee: string
          code_qp: string
          commune_qp: string
          created_at: string
          departement: string | null
          id: string
          metadata: Json | null
          nom_qp: string
          population: number | null
          region: string | null
          updated_at: string
        }
        Insert: {
          code_insee: string
          code_qp: string
          commune_qp: string
          created_at?: string
          departement?: string | null
          id?: string
          metadata?: Json | null
          nom_qp: string
          population?: number | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          code_insee?: string
          code_qp?: string
          commune_qp?: string
          created_at?: string
          departement?: string | null
          id?: string
          metadata?: Json | null
          nom_qp?: string
          population?: number | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      refresh_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          revoked: boolean
          session_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          revoked?: boolean
          session_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          revoked?: boolean
          session_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_metrics: {
        Row: {
          created_at: string
          id: string
          metric_key: string
          metric_value: Json | null
          period_end: string
          period_start: string
          territory_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_key: string
          metric_value?: Json | null
          period_end: string
          period_start: string
          territory_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_key?: string
          metric_value?: Json | null
          period_end?: string
          period_start?: string
          territory_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_metrics_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_metrics_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      reviews: {
        Row: {
          activity_id: string
          child_id: string
          comment: string | null
          created_at: string
          id: string
          published_at: string | null
          rating: number
          user_id: string
        }
        Insert: {
          activity_id: string
          child_id: string
          comment?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          rating: number
          user_id: string
        }
        Update: {
          activity_id?: string
          child_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_age"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          access_jti: string | null
          created_at: string
          device: string | null
          id: string
          ip: unknown
          last_seen_at: string
          mfa_verified: boolean
          revoked: boolean
          roles: string[]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          access_jti?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: unknown
          last_seen_at?: string
          mfa_verified?: boolean
          revoked?: boolean
          roles?: string[]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          access_jti?: string | null
          created_at?: string
          device?: string | null
          id?: string
          ip?: unknown
          last_seen_at?: string
          mfa_verified?: boolean
          revoked?: boolean
          roles?: string[]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      structures: {
        Row: {
          accessibility_profile: Json | null
          address: string | null
          contact_json: Json | null
          created_at: string
          id: string
          location: unknown
          name: string
          territory_id: string
          updated_at: string
        }
        Insert: {
          accessibility_profile?: Json | null
          address?: string | null
          contact_json?: Json | null
          created_at?: string
          id?: string
          location?: unknown
          name: string
          territory_id: string
          updated_at?: string
        }
        Update: {
          accessibility_profile?: Json | null
          address?: string | null
          contact_json?: Json | null
          created_at?: string
          id?: string
          location?: unknown
          name?: string
          territory_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structures_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "structures_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      territories: {
        Row: {
          active: boolean | null
          config_json: Json | null
          covered: boolean | null
          created_at: string
          department_code: string | null
          geojson: Json | null
          id: string
          name: string
          parent_id: string | null
          postal_codes: string[] | null
          region_code: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          config_json?: Json | null
          covered?: boolean | null
          created_at?: string
          department_code?: string | null
          geojson?: Json | null
          id?: string
          name: string
          parent_id?: string | null
          postal_codes?: string[] | null
          region_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          config_json?: Json | null
          covered?: boolean | null
          created_at?: string
          department_code?: string | null
          geojson?: Json | null
          id?: string
          name?: string
          parent_id?: string | null
          postal_codes?: string[] | null
          region_code?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "territories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      transport_offers: {
        Row: {
          activity_id: string
          arrival_time: string | null
          carbon_saved_kg: number | null
          created_at: string | null
          currency: string | null
          departure_time: string | null
          distance_m: number | null
          end_lat: number | null
          end_lon: number | null
          expired: boolean | null
          external_id: string | null
          id: string
          mode: string
          nearest_station_id: string | null
          nearest_station_source: string | null
          nearest_stop_id: string | null
          nearest_stop_source: string | null
          price_cents: number | null
          price_estimate: number | null
          raw: Json | null
          route_details: Json | null
          source: string | null
          start_lat: number | null
          start_lon: number | null
          station_id: string | null
          travel_time_min: number | null
          updated_at: string | null
        }
        Insert: {
          activity_id: string
          arrival_time?: string | null
          carbon_saved_kg?: number | null
          created_at?: string | null
          currency?: string | null
          departure_time?: string | null
          distance_m?: number | null
          end_lat?: number | null
          end_lon?: number | null
          expired?: boolean | null
          external_id?: string | null
          id?: string
          mode: string
          nearest_station_id?: string | null
          nearest_station_source?: string | null
          nearest_stop_id?: string | null
          nearest_stop_source?: string | null
          price_cents?: number | null
          price_estimate?: number | null
          raw?: Json | null
          route_details?: Json | null
          source?: string | null
          start_lat?: number | null
          start_lon?: number | null
          station_id?: string | null
          travel_time_min?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string
          arrival_time?: string | null
          carbon_saved_kg?: number | null
          created_at?: string | null
          currency?: string | null
          departure_time?: string | null
          distance_m?: number | null
          end_lat?: number | null
          end_lon?: number | null
          expired?: boolean | null
          external_id?: string | null
          id?: string
          mode?: string
          nearest_station_id?: string | null
          nearest_station_source?: string | null
          nearest_stop_id?: string | null
          nearest_stop_source?: string | null
          price_cents?: number | null
          price_estimate?: number | null
          raw?: Json | null
          route_details?: Json | null
          source?: string | null
          start_lat?: number | null
          start_lon?: number | null
          station_id?: string | null
          travel_time_min?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_offers_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_offers_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "transport_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_stations: {
        Row: {
          created_at: string | null
          external_id: string | null
          id: string
          location: unknown
          metadata: Json | null
          name: string
          station_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          location?: unknown
          metadata?: Json | null
          name: string
          station_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          id?: string
          location?: unknown
          metadata?: Json | null
          name?: string
          station_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transport_stops: {
        Row: {
          id: string
          lat: number
          lines: string[] | null
          lon: number
          name: string | null
          raw: Json | null
          source: string
          stop_id: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          lat: number
          lines?: string[] | null
          lon: number
          name?: string | null
          raw?: Json | null
          source: string
          stop_id: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          lat?: number
          lines?: string[] | null
          lon?: number
          name?: string | null
          raw?: Json | null
          source?: string
          stop_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transport_sync_meta: {
        Row: {
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          provider: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          territory_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          territory_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          territory_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      validations_parentales: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          parent_id: string
          reason_refus: string | null
          reminders_sent: number | null
          status: string
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          parent_id: string
          reason_refus?: string | null
          reminders_sent?: number | null
          status: string
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          parent_id?: string
          reason_refus?: string | null
          reminders_sent?: number | null
          status?: string
          updated_at?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validations_parentales_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      territory_user_stats: {
        Row: {
          avg_quotient_familial: number | null
          divorced_count: number | null
          high_income_count: number | null
          low_income_count: number | null
          married_count: number | null
          medium_income_count: number | null
          postal_code_prefixes: string[] | null
          single_count: number | null
          territory_id: string | null
          total_users: number | null
          widowed_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "vw_dashboard_collectivite_overview"
            referencedColumns: ["territory_id"]
          },
        ]
      }
      v_children_with_age: {
        Row: {
          accessibility_flags: Json | null
          age: number | null
          created_at: string | null
          dob: string | null
          education_level: string | null
          first_name: string | null
          id: string | null
          is_student: boolean | null
          needs_json: Json | null
          school_postal_code: string | null
          student_status_hint: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accessibility_flags?: Json | null
          age?: never
          created_at?: string | null
          dob?: string | null
          education_level?: string | null
          first_name?: string | null
          id?: string | null
          is_student?: boolean | null
          needs_json?: Json | null
          school_postal_code?: string | null
          student_status_hint?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accessibility_flags?: Json | null
          age?: never
          created_at?: string | null
          dob?: string | null
          education_level?: string | null
          first_name?: string | null
          id?: string | null
          is_student?: boolean | null
          needs_json?: Json | null
          school_postal_code?: string | null
          student_status_hint?: never
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profile_completion"
            referencedColumns: ["id"]
          },
        ]
      }
      v_profile_completion: {
        Row: {
          completion_message: string | null
          completion_status: string | null
          email: string | null
          has_children: boolean | null
          has_marital_status: boolean | null
          has_postal_code: boolean | null
          has_qf: boolean | null
          has_territory: boolean | null
          id: string | null
        }
        Relationships: []
      }
      vw_alternative_slots: {
        Row: {
          activity_id: string | null
          activity_title: string | null
          age_max: number | null
          age_min: number | null
          category: string | null
          end: string | null
          period_type: string | null
          price_base: number | null
          seats_remaining: number | null
          seats_total: number | null
          slot_id: string | null
          start: string | null
          structure_address: string | null
          structure_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_dashboard_collectivite_overview: {
        Row: {
          published_activities: number | null
          territory_id: string | null
          territory_name: string | null
          territory_type: string | null
          total_activities: number | null
          total_aid_simulations: number | null
          total_registrations: number | null
          total_revenue_potential: number | null
          unique_children_registered: number | null
        }
        Relationships: []
      }
      vw_dashboard_financeur_aid_usage: {
        Row: {
          aid_categories: string[] | null
          aid_description: string | null
          aid_id: string | null
          aid_name: string | null
          avg_aid_amount: number | null
          territory_level: string | null
          total_children_benefiting: number | null
          total_simulated_amount: number | null
          total_simulations: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_age: { Args: { birth_date: string }; Returns: number }
      calculate_eligible_aids: {
        Args: {
          p_activity_price: number
          p_age: number
          p_categories: string[]
          p_city_code: string
          p_duration_days: number
          p_qf: number
        }
        Returns: {
          aid_name: string
          amount: number
          official_link: string
          territory_level: string
        }[]
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_expired_sessions_and_tokens: { Args: never; Returns: number }
      cleanup_old_sessions: { Args: never; Returns: number }
      decrement_seat_atomic: {
        Args: { _booking_id: string; _slot_id: string }
        Returns: Json
      }
      get_child_age: { Args: { birth_date: string }; Returns: number }
      get_territories_from_postal: {
        Args: { postal_code: string }
        Returns: {
          territory_id: string
          territory_level: number
          territory_name: string
          territory_type: string
        }[]
      }
      get_territory_from_postal: {
        Args: { postal_code: string }
        Returns: {
          territory_id: string
          territory_name: string
          territory_type: string
        }[]
      }
      get_user_territory: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_backup_code: { Args: { plain_code: string }; Returns: string }
      log_audit_event: {
        Args: {
          _action: string
          _ip_address?: unknown
          _metadata?: Json
          _resource_id?: string
          _resource_type: string
          _user_agent?: string
          _user_id: string
        }
        Returns: string
      }
      revoke_session: {
        Args: { p_reason?: string; p_session_id: string }
        Returns: undefined
      }
      touch_session_lastseen: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      update_session_last_seen: {
        Args: { _session_id: string }
        Returns: undefined
      }
      validate_booking_eligibility: {
        Args: { p_activity_id: string; p_child_id: string; p_slot_id: string }
        Returns: Json
      }
      validate_mfa_backup_code: {
        Args: { p_code_attempt: string; p_user_id: string }
        Returns: boolean
      }
      verify_backup_code: {
        Args: { hashed_code: string; plain_code: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "family"
        | "structure"
        | "territory_admin"
        | "partner"
        | "superadmin"
        | "collectivite_viewer"
      booking_status: "en_attente" | "validee" | "refusee" | "annulee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "family",
        "structure",
        "territory_admin",
        "partner",
        "superadmin",
        "collectivite_viewer",
      ],
      booking_status: ["en_attente", "validee", "refusee", "annulee"],
    },
  },
} as const
