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
      activities: {
        Row: {
          accepts_aid_types: Json | null
          acm_type: string | null
          address: string | null
          age_max: number | null
          age_min: number | null
          bike_friendly: boolean | null
          categories: string[] | null
          category_id: string | null
          city: string | null
          created_at: string | null
          creneaux: Json | null
          date_debut: string | null
          date_fin: string | null
          description: string | null
          duration_days: number | null
          has_accessibility: boolean | null
          has_accommodation: boolean | null
          has_free_trial: boolean | null
          id: string
          image_url: string | null
          is_overnight: boolean | null
          is_published: boolean | null
          jours_horaires: string | null
          latitude: number | null
          lieu_nom: string | null
          longitude: number | null
          max_participants: number | null
          mobility_covoit: boolean | null
          mobility_tc: string | null
          mobility_types: string[] | null
          mobility_velo: boolean | null
          organism_email: string | null
          organism_id: string | null
          organism_name: string | null
          organism_phone: string | null
          organism_type: string | null
          organism_website: string | null
          period_type: string | null
          pieces_a_fournir: string[] | null
          postal_code: string | null
          prerequis: string[] | null
          price_base: number | null
          price_unit: string | null
          public_transport_nearby: boolean | null
          sante_tags: string[] | null
          sessions: string | null
          tags: Json | null
          title: string
          transport_info: string | null
          updated_at: string | null
          vacation_periods: Json | null
          vacation_type: string | null
          venue_name: string | null
          walking_friendly: boolean | null
        }
        Insert: {
          accepts_aid_types?: Json | null
          acm_type?: string | null
          address?: string | null
          age_max?: number | null
          age_min?: number | null
          bike_friendly?: boolean | null
          categories?: string[] | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          creneaux?: Json | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          duration_days?: number | null
          has_accessibility?: boolean | null
          has_accommodation?: boolean | null
          has_free_trial?: boolean | null
          id?: string
          image_url?: string | null
          is_overnight?: boolean | null
          is_published?: boolean | null
          jours_horaires?: string | null
          latitude?: number | null
          lieu_nom?: string | null
          longitude?: number | null
          max_participants?: number | null
          mobility_covoit?: boolean | null
          mobility_tc?: string | null
          mobility_types?: string[] | null
          mobility_velo?: boolean | null
          organism_email?: string | null
          organism_id?: string | null
          organism_name?: string | null
          organism_phone?: string | null
          organism_type?: string | null
          organism_website?: string | null
          period_type?: string | null
          pieces_a_fournir?: string[] | null
          postal_code?: string | null
          prerequis?: string[] | null
          price_base?: number | null
          price_unit?: string | null
          public_transport_nearby?: boolean | null
          sante_tags?: string[] | null
          sessions?: string | null
          tags?: Json | null
          title: string
          transport_info?: string | null
          updated_at?: string | null
          vacation_periods?: Json | null
          vacation_type?: string | null
          venue_name?: string | null
          walking_friendly?: boolean | null
        }
        Update: {
          accepts_aid_types?: Json | null
          acm_type?: string | null
          address?: string | null
          age_max?: number | null
          age_min?: number | null
          bike_friendly?: boolean | null
          categories?: string[] | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          creneaux?: Json | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          duration_days?: number | null
          has_accessibility?: boolean | null
          has_accommodation?: boolean | null
          has_free_trial?: boolean | null
          id?: string
          image_url?: string | null
          is_overnight?: boolean | null
          is_published?: boolean | null
          jours_horaires?: string | null
          latitude?: number | null
          lieu_nom?: string | null
          longitude?: number | null
          max_participants?: number | null
          mobility_covoit?: boolean | null
          mobility_tc?: string | null
          mobility_types?: string[] | null
          mobility_velo?: boolean | null
          organism_email?: string | null
          organism_id?: string | null
          organism_name?: string | null
          organism_phone?: string | null
          organism_type?: string | null
          organism_website?: string | null
          period_type?: string | null
          pieces_a_fournir?: string[] | null
          postal_code?: string | null
          prerequis?: string[] | null
          price_base?: number | null
          price_unit?: string | null
          public_transport_nearby?: boolean | null
          sante_tags?: string[] | null
          sessions?: string | null
          tags?: Json | null
          title?: string
          transport_info?: string | null
          updated_at?: string | null
          vacation_periods?: Json | null
          vacation_type?: string | null
          venue_name?: string | null
          walking_friendly?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "activity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organism_id_fkey"
            columns: ["organism_id"]
            isOneToOne: false
            referencedRelation: "organisms"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      activity_media: {
        Row: {
          activity_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
          media_type: string
          media_url: string
          thumbnail_url: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_type: string
          media_url: string
          thumbnail_url?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_media_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_media_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_media_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_prices: {
        Row: {
          activity_id: string | null
          amount: number
          created_at: string | null
          id: string
          price_type: string
          quotient_max: number | null
          quotient_min: number | null
        }
        Insert: {
          activity_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          price_type: string
          quotient_max?: number | null
          quotient_min?: number | null
        }
        Update: {
          activity_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          price_type?: string
          quotient_max?: number | null
          quotient_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_prices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_prices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_prices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_sessions: {
        Row: {
          activity_id: string | null
          age_max: number | null
          age_min: number | null
          created_at: string | null
          current_participants: number | null
          day_of_week: number | null
          end_date: string | null
          end_time: string
          id: string
          location: string | null
          max_participants: number | null
          period_type: string | null
          price: number | null
          start_date: string | null
          start_time: string
        }
        Insert: {
          activity_id?: string | null
          age_max?: number | null
          age_min?: number | null
          created_at?: string | null
          current_participants?: number | null
          day_of_week?: number | null
          end_date?: string | null
          end_time: string
          id?: string
          location?: string | null
          max_participants?: number | null
          period_type?: string | null
          price?: number | null
          start_date?: string | null
          start_time: string
        }
        Update: {
          activity_id?: string | null
          age_max?: number | null
          age_min?: number | null
          created_at?: string | null
          current_participants?: number | null
          day_of_week?: number | null
          end_date?: string | null
          end_time?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          period_type?: string | null
          price?: number | null
          start_date?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_sessions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          last_used_at: string | null
          name: string
          profile_id: string | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          last_used_at?: string | null
          name: string
          profile_id?: string | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          last_used_at?: string | null
          name?: string
          profile_id?: string | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          activity_id: string | null
          created_at: string | null
          end: string
          id: string
          seats_remaining: number | null
          seats_total: number | null
          start: string
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          end: string
          id?: string
          seats_remaining?: number | null
          seats_total?: number | null
          start: string
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          end?: string
          id?: string
          seats_remaining?: number | null
          seats_total?: number | null
          start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_temp_requests: {
        Row: {
          activity_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          linking_code: string
          minor_profile_id: string
          parent_id: string | null
          rejected_at: string | null
          rejection_reason: string | null
          slot_id: string | null
          status: Database["public"]["Enums"]["child_request_status"]
          updated_at: string | null
          validated_at: string | null
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          linking_code: string
          minor_profile_id: string
          parent_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          slot_id?: string | null
          status?: Database["public"]["Enums"]["child_request_status"]
          updated_at?: string | null
          validated_at?: string | null
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          linking_code?: string
          minor_profile_id?: string
          parent_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          slot_id?: string | null
          status?: Database["public"]["Enums"]["child_request_status"]
          updated_at?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_temp_requests_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_temp_requests_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_temp_requests_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_temp_requests_minor_profile_id_fkey"
            columns: ["minor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_temp_requests_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_temp_requests_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string[] | null
          birth_date: string
          created_at: string | null
          disability_type: string | null
          emergency_contact: string | null
          family_id: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          has_disability: boolean | null
          id: string
          last_name: string
          medical_notes: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          birth_date: string
          created_at?: string | null
          disability_type?: string | null
          emergency_contact?: string | null
          family_id?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          has_disability?: boolean | null
          id?: string
          last_name: string
          medical_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          birth_date?: string
          created_at?: string | null
          disability_type?: string | null
          emergency_contact?: string | null
          family_id?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          has_disability?: boolean | null
          id?: string
          last_name?: string
          medical_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
        ]
      }
      collectivities: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          postal_code: string | null
          profile_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          postal_code?: string | null
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          postal_code?: string | null
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collectivities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          activity_id: string | null
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          name: string
          profile_id: string | null
          type: string
          uploaded_at: string | null
        }
        Insert: {
          activity_id?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          name: string
          profile_id?: string | null
          type: string
          uploaded_at?: string | null
        }
        Update: {
          activity_id?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          name?: string
          profile_id?: string | null
          type?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          activity_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          territory_code: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          territory_code?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          territory_code?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          csp: string | null
          email: string | null
          family_situation:
            | Database["public"]["Enums"]["family_situation"]
            | null
          id: string
          is_qpv: boolean | null
          latitude: number | null
          longitude: number | null
          max_distance_km: number | null
          newsletter_opt_in: boolean | null
          postal_code: string | null
          preferred_categories: string[] | null
          profile_id: string | null
          quotient_familial: number | null
          territory_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          csp?: string | null
          email?: string | null
          family_situation?:
            | Database["public"]["Enums"]["family_situation"]
            | null
          id?: string
          is_qpv?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_distance_km?: number | null
          newsletter_opt_in?: boolean | null
          postal_code?: string | null
          preferred_categories?: string[] | null
          profile_id?: string | null
          quotient_familial?: number | null
          territory_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          csp?: string | null
          email?: string | null
          family_situation?:
            | Database["public"]["Enums"]["family_situation"]
            | null
          id?: string
          is_qpv?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_distance_km?: number | null
          newsletter_opt_in?: boolean | null
          postal_code?: string | null
          preferred_categories?: string[] | null
          profile_id?: string | null
          quotient_familial?: number | null
          territory_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "families_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          activity_id: string | null
          created_at: string | null
          family_id: string | null
          id: string
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
        ]
      }
      financial_aids: {
        Row: {
          amount: number | null
          amount_type: string | null
          created_at: string | null
          description: string | null
          eligibility_criteria: Json | null
          id: string
          name: string
          partner_id: string | null
          percentage: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          amount?: number | null
          amount_type?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          name: string
          partner_id?: string | null
          percentage?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number | null
          amount_type?: string | null
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          name?: string
          partner_id?: string | null
          percentage?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_aids_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "financial_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_partners: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          profile_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_partners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mobility_choices: {
        Row: {
          activity_id: string | null
          created_at: string | null
          id: string
          station_name: string | null
          transport_mode: string
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          station_name?: string | null
          transport_mode: string
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          station_name?: string | null
          transport_mode?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobility_choices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_choices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mobility_choices_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          profile_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          profile_id?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          profile_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisms: {
        Row: {
          address: string | null
          approval_number: string | null
          average_rating: number | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          insurance_certificate_url: string | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          profile_id: string | null
          siret: string | null
          total_reviews: number | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          approval_number?: string | null
          average_rating?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          insurance_certificate_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          siret?: string | null
          total_reviews?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          approval_number?: string | null
          average_rating?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          insurance_certificate_url?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          profile_id?: string | null
          siret?: string | null
          total_reviews?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisms_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          family_id: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          registration_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          family_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          family_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          registration_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dob: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          linking_code: string | null
          parent_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          white_label_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          linking_code?: string | null
          parent_id?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          white_label_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          linking_code?: string | null
          parent_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          white_label_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          activity_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          child_id: string | null
          confirmed_at: string | null
          created_at: string | null
          family_id: string | null
          id: string
          notes: string | null
          registration_date: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          child_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          child_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          notes?: string | null
          registration_date?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "vw_enfants_infos_sante"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "registrations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
          {
            foreignKeyName: "registrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "activity_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          activity_id: string | null
          aid_types_used: Json | null
          amount_aided: number | null
          amount_paid: number | null
          amount_total: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          child_id: string | null
          confirmed_at: string | null
          created_at: string | null
          family_id: string | null
          id: string
          status: string | null
          transport_mode: string | null
        }
        Insert: {
          activity_id?: string | null
          aid_types_used?: Json | null
          amount_aided?: number | null
          amount_paid?: number | null
          amount_total?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          child_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          status?: string | null
          transport_mode?: string | null
        }
        Update: {
          activity_id?: string | null
          aid_types_used?: Json | null
          amount_aided?: number | null
          amount_paid?: number | null
          amount_total?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          child_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          status?: string | null
          transport_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "vw_enfants_infos_sante"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reservations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
        ]
      }
      reviews: {
        Row: {
          activity_id: string | null
          comment: string | null
          created_at: string | null
          family_id: string | null
          id: string
          is_verified: boolean | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          activity_id?: string | null
          comment?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_id?: string | null
          comment?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          updated_at?: string | null
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
            foreignKeyName: "reviews_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_age_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities_with_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          family_id: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
        }
        Insert: {
          created_at?: string | null
          family_id?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
        }
        Update: {
          created_at?: string | null
          family_id?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_history_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "vw_fratrie_groups"
            referencedColumns: ["family_id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_stations: {
        Row: {
          capacity: number | null
          created_at: string | null
          external_id: string | null
          id: string
          lat: number | null
          lon: number | null
          metadata: Json | null
          name: string | null
          provider: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          metadata?: Json | null
          name?: string | null
          provider: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          lat?: number | null
          lon?: number | null
          metadata?: Json | null
          name?: string | null
          provider?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          profile_id: string | null
          secret: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          profile_id?: string | null
          secret?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          profile_id?: string | null
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      white_labels: {
        Row: {
          created_at: string | null
          custom_css: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_css?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_css?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      activities_with_age_groups: {
        Row: {
          accepts_aid_types: Json | null
          address: string | null
          age_groups: string | null
          age_max: number | null
          age_min: number | null
          bike_friendly: boolean | null
          categories: string[] | null
          category_id: string | null
          city: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          description: string | null
          has_accessibility: boolean | null
          has_free_trial: boolean | null
          id: string | null
          is_published: boolean | null
          jours_horaires: string | null
          latitude: number | null
          longitude: number | null
          max_participants: number | null
          mobility_types: string[] | null
          organism_id: string | null
          period_type: string | null
          postal_code: string | null
          price_base: number | null
          price_unit: string | null
          public_transport_nearby: boolean | null
          sessions: string | null
          tags: Json | null
          title: string | null
          updated_at: string | null
          vacation_periods: Json | null
          walking_friendly: boolean | null
        }
        Insert: {
          accepts_aid_types?: Json | null
          address?: string | null
          age_groups?: never
          age_max?: number | null
          age_min?: number | null
          bike_friendly?: boolean | null
          categories?: string[] | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          has_accessibility?: boolean | null
          has_free_trial?: boolean | null
          id?: string | null
          is_published?: boolean | null
          jours_horaires?: string | null
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          mobility_types?: string[] | null
          organism_id?: string | null
          period_type?: string | null
          postal_code?: string | null
          price_base?: number | null
          price_unit?: string | null
          public_transport_nearby?: boolean | null
          sessions?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          vacation_periods?: Json | null
          walking_friendly?: boolean | null
        }
        Update: {
          accepts_aid_types?: Json | null
          address?: string | null
          age_groups?: never
          age_max?: number | null
          age_min?: number | null
          bike_friendly?: boolean | null
          categories?: string[] | null
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          has_accessibility?: boolean | null
          has_free_trial?: boolean | null
          id?: string | null
          is_published?: boolean | null
          jours_horaires?: string | null
          latitude?: number | null
          longitude?: number | null
          max_participants?: number | null
          mobility_types?: string[] | null
          organism_id?: string | null
          period_type?: string | null
          postal_code?: string | null
          price_base?: number | null
          price_unit?: string | null
          public_transport_nearby?: boolean | null
          sessions?: string | null
          tags?: Json | null
          title?: string | null
          updated_at?: string | null
          vacation_periods?: Json | null
          walking_friendly?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "activity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organism_id_fkey"
            columns: ["organism_id"]
            isOneToOne: false
            referencedRelation: "organisms"
            referencedColumns: ["id"]
          },
        ]
      }
      activities_with_sessions: {
        Row: {
          accepts_aid_types: Json | null
          accessibility: Json | null
          address: string | null
          age_max: number | null
          age_min: number | null
          categories: string[] | null
          category: string | null
          city: string | null
          covoiturage_enabled: boolean | null
          created_at: string | null
          creneaux: Json | null
          date_debut: string | null
          date_fin: string | null
          description: string | null
          duration_days: number | null
          has_accessibility: boolean | null
          has_accommodation: boolean | null
          id: string | null
          image_url: string | null
          is_published: boolean | null
          jours_horaires: string | null
          latitude: number | null
          lieu_nom: string | null
          longitude: number | null
          mobility_covoit: boolean | null
          mobility_tc: string | null
          mobility_types: string[] | null
          mobility_velo: boolean | null
          organism_email: string | null
          organism_id: string | null
          organism_name: string | null
          organism_phone: string | null
          organism_type: string | null
          organism_website: string | null
          period_type: string | null
          pieces_a_fournir: string[] | null
          postal_code: string | null
          prerequis: string[] | null
          price_base: number | null
          price_unit: string | null
          sante_tags: string[] | null
          session_age_max: number | null
          session_age_min: number | null
          sessions_json: Json | null
          tags: Json | null
          title: string | null
          transport_info: string | null
          updated_at: string | null
          vacation_periods: Json | null
          vacation_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_organism_id_fkey"
            columns: ["organism_id"]
            isOneToOne: false
            referencedRelation: "organisms"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_enfants_infos_sante: {
        Row: {
          age: number | null
          allergies: string[] | null
          child_id: string | null
          city: string | null
          emergency_contact: string | null
          first_name: string | null
          last_name: string | null
          medical_notes: string | null
          nombre_inscriptions: number | null
          postal_code: string | null
          statut_infos_sante: string | null
        }
        Relationships: []
      }
      vw_fratrie_groups: {
        Row: {
          ages: number[] | null
          city: string | null
          family_id: string | null
          nombre_enfants: number | null
          prenoms: string[] | null
        }
        Relationships: []
      }
      vw_inscriptions_stats: {
        Row: {
          activites_reservees: number | null
          enfants_inscrits: number | null
          familles_inscrites: number | null
          inscriptions_3_mois: number | null
          inscriptions_annulees: number | null
          inscriptions_confirmees: number | null
          total_inscriptions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_child_temp_request: {
        Args: { p_activity_id: string; p_minor_id: string; p_slot_id?: string }
        Returns: {
          linking_code: string
          request_id: string
        }[]
      }
      earth: { Args: never; Returns: number }
      generate_linking_code: { Args: never; Returns: string }
      generate_profile_linking_code: {
        Args: { profile_id: string }
        Returns: string
      }
      get_activities_with_details: {
        Args: never
        Returns: {
          accepts_aid_types: Json
          age_max: number
          age_min: number
          categories: string[]
          category_id: string
          covoiturage_enabled: boolean
          description: string
          has_free_trial: boolean
          id: string
          is_published: boolean
          latitude: number
          longitude: number
          organism_address: string
          organism_id: string
          organism_logo_url: string
          organism_name: string
          period_type: string
          prices: Json
          sessions: Json
          tags: Json
          title: string
          vacation_periods: Json
        }[]
      }
      link_parent_to_minor: {
        Args: { p_linking_code: string; p_parent_id: string }
        Returns: Json
      }
      validate_child_request: {
        Args: { p_action: string; p_parent_id: string; p_request_id: string }
        Returns: Json
      }
    }
    Enums: {
      child_request_status:
        | "waiting_parent_link"
        | "parent_linked"
        | "validated"
        | "rejected"
        | "expired"
      family_situation: "single" | "couple" | "single_parent" | "blended"
      gender: "male" | "female" | "other" | "prefer_not_to_say"
      payment_status: "pending" | "paid" | "partial" | "failed" | "refunded"
      registration_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "waiting_list"
      user_role:
        | "family"
        | "organism"
        | "collectivity"
        | "financial_partner"
        | "super_admin"
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
      child_request_status: [
        "waiting_parent_link",
        "parent_linked",
        "validated",
        "rejected",
        "expired",
      ],
      family_situation: ["single", "couple", "single_parent", "blended"],
      gender: ["male", "female", "other", "prefer_not_to_say"],
      payment_status: ["pending", "paid", "partial", "failed", "refunded"],
      registration_status: [
        "pending",
        "confirmed",
        "cancelled",
        "waiting_list",
      ],
      user_role: [
        "family",
        "organism",
        "collectivity",
        "financial_partner",
        "super_admin",
      ],
    },
  },
} as const
