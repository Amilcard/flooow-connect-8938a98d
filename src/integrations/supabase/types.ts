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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
        ]
      }
      activities: {
        Row: {
          accepts_aid_types: Json | null
          accessibility_checklist: Json | null
          age_max: number | null
          age_min: number | null
          capacity_policy: Json | null
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
          video_url: string | null
          webhook_url_for_docs: string | null
        }
        Insert: {
          accepts_aid_types?: Json | null
          accessibility_checklist?: Json | null
          age_max?: number | null
          age_min?: number | null
          capacity_policy?: Json | null
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
          video_url?: string | null
          webhook_url_for_docs?: string | null
        }
        Update: {
          accepts_aid_types?: Json | null
          accessibility_checklist?: Json | null
          age_max?: number | null
          age_min?: number | null
          capacity_policy?: Json | null
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
            foreignKeyName: "aid_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
          end: string
          id: string
          recurrence: Json | null
          seats_remaining: number
          seats_total: number
          start: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          end: string
          id?: string
          recurrence?: Json | null
          seats_remaining?: number
          seats_total?: number
          start: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          end?: string
          id?: string
          recurrence?: Json | null
          seats_remaining?: number
          seats_total?: number
          start?: string
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
      bookings: {
        Row: {
          activity_id: string
          child_id: string
          created_at: string
          express_flag: boolean | null
          history: Json | null
          id: string
          idempotency_key: string | null
          reason_code: string | null
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
          reason_code?: string | null
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
          reason_code?: string | null
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
            foreignKeyName: "bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          accessibility_flags: Json | null
          created_at: string
          dob: string
          first_name: string
          id: string
          needs_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_flags?: Json | null
          created_at?: string
          dob: string
          first_name: string
          id?: string
          needs_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_flags?: Json | null
          created_at?: string
          dob?: string
          first_name?: string
          id?: string
          needs_json?: Json | null
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
          id: string
          name: string
          official_link: string | null
          qf_max: number | null
          slug: string
          territory_codes: string[]
          territory_level: string
          updated_at: string
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
          id?: string
          name: string
          official_link?: string | null
          qf_max?: number | null
          slug: string
          territory_codes?: string[]
          territory_level: string
          updated_at?: string
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
          id?: string
          name?: string
          official_link?: string | null
          qf_max?: number | null
          slug?: string
          territory_codes?: string[]
          territory_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          backup_codes: Json | null
          created_at: string
          enforced: boolean | null
          id: string
          mfa_enabled: boolean | null
          mfa_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string
          enforced?: boolean | null
          id?: string
          mfa_enabled?: boolean | null
          mfa_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: Json | null
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
        ]
      }
      profiles: {
        Row: {
          city_insee: string | null
          created_at: string
          email: string
          id: string
          profile_json: Json | null
          territory_id: string | null
          updated_at: string
        }
        Insert: {
          city_insee?: string | null
          created_at?: string
          email: string
          id: string
          profile_json?: Json | null
          territory_id?: string | null
          updated_at?: string
        }
        Update: {
          city_insee?: string | null
          created_at?: string
          email?: string
          id?: string
          profile_json?: Json | null
          territory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_territory_id_fkey"
            columns: ["territory_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions_report"
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
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          ip: unknown | null
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
          ip?: unknown | null
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
          ip?: unknown | null
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
          location: unknown | null
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
          location?: unknown | null
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
          location?: unknown | null
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
        ]
      }
      territories: {
        Row: {
          config_json: Json | null
          covered: boolean | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          config_json?: Json | null
          covered?: boolean | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          config_json?: Json | null
          covered?: boolean | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      sessions_report: {
        Row: {
          created_at: string | null
          device: string | null
          id: string | null
          ip: unknown | null
          last_seen_at: string | null
          mfa_verified: boolean | null
          refresh_token_expires_at: string | null
          refresh_token_revoked: boolean | null
          revoked: boolean | null
          roles: string[] | null
          tenant_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
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
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_sessions_and_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      decrement_seat_atomic: {
        Args: { _booking_id: string; _slot_id: string }
        Returns: Json
      }
      get_user_territory: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
    }
    Enums: {
      app_role:
        | "family"
        | "structure"
        | "territory_admin"
        | "partner"
        | "superadmin"
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
      ],
      booking_status: ["en_attente", "validee", "refusee", "annulee"],
    },
  },
} as const
