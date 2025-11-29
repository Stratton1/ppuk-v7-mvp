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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_path: string | null
          resource_type: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_path?: string | null
          resource_type: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_path?: string | null
          resource_type?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          created_by_user_id: string
          deleted_at: string | null
          display_address: string
          id: string
          latitude: number | null
          longitude: number | null
          public_slug: string | null
          public_visibility: boolean | null
          status: string
          updated_at: string
          uprn: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          deleted_at?: string | null
          display_address: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          public_slug?: string | null
          public_visibility?: boolean | null
          status?: string
          updated_at?: string
          uprn: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          deleted_at?: string | null
          display_address?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          public_slug?: string | null
          public_visibility?: boolean | null
          status?: string
          updated_at?: string
          uprn?: string
        }
        Relationships: []
      }
      property_documents: {
        Row: {
          checksum: string | null
          created_at: string
          deleted_at: string | null
          document_type: string
          id: string
          mime_type: string
          property_id: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          title: string
          updated_at: string
          uploaded_by_user_id: string
          version: number
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type?: string
          id?: string
          mime_type: string
          property_id: string
          size_bytes: number
          status?: string
          storage_bucket?: string
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by_user_id: string
          version?: number
        }
        Update: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type?: string
          id?: string
          mime_type?: string
          property_id?: string
          size_bytes?: number
          status?: string
          storage_bucket?: string
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by_user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type: string
          id?: string
          property_id: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_flags: {
        Row: {
          created_at: string
          created_by_user_id: string
          deleted_at: string | null
          description: string | null
          flag_type: string
          id: string
          property_id: string
          resolved_at: string | null
          resolved_by_user_id: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          deleted_at?: string | null
          description?: string | null
          flag_type: string
          id?: string
          property_id: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          deleted_at?: string | null
          description?: string | null
          flag_type?: string
          id?: string
          property_id?: string
          resolved_at?: string | null
          resolved_by_user_id?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_flags_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_media: {
        Row: {
          checksum: string | null
          created_at: string
          deleted_at: string | null
          id: string
          media_type: string
          mime_type: string
          property_id: string
          size_bytes: number
          status: string
          storage_bucket: string
          storage_path: string
          title: string
          updated_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_type?: string
          mime_type: string
          property_id: string
          size_bytes: number
          status?: string
          storage_bucket?: string
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_type?: string
          mime_type?: string
          property_id?: string
          size_bytes?: number
          status?: string
          storage_bucket?: string
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_notes: {
        Row: {
          content: string
          created_at: string
          created_by_user_id: string
          id: string
          is_private: boolean
          note_type: string
          pinned: boolean
          property_id: string
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by_user_id: string
          id?: string
          is_private?: boolean
          note_type?: string
          pinned?: boolean
          property_id: string
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          is_private?: boolean
          note_type?: string
          pinned?: boolean
          property_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_notes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_tasks: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          created_by_user_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          property_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string
          created_by_user_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          property_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          property_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_property_roles: {
        Row: {
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          granted_at: string
          granted_by_user_id: string | null
          id: string
          property_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id?: string | null
          id?: string
          property_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id?: string | null
          id?: string
          property_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_property_roles_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      users_extended: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          full_name: string | null
          id: string
          organisation: string | null
          phone: string | null
          primary_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          organisation?: string | null
          phone?: string | null
          primary_role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          organisation?: string | null
          phone?: string | null
          primary_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_property_completion: {
        Args: { property_id: string }
        Returns: number
      }
      can_access_document: { Args: { document_id: string }; Returns: boolean }
      create_property_with_event: {
        Args: {
          p_display_address: string
          p_latitude?: number
          p_longitude?: number
          p_status?: string
          p_uprn: string
        }
        Returns: string
      }
      create_property_with_role: {
        Args: {
          p_display_address: string
          p_latitude?: number
          p_longitude?: number
          p_status?: string
          p_uprn: string
        }
        Returns: string
      }
      get_dashboard_stats: {
        Args: { auth_uid: string }
        Returns: {
          accessible_properties: number
          owned_properties: number
          total_documents: number
          total_media: number
          unresolved_flags: number
        }[]
      }
      get_featured_media: {
        Args: { property_id: string }
        Returns: {
          id: string
          storage_path: string
        }[]
      }
      get_property_notes: {
        Args: { property_id: string }
        Returns: {
          content: string
          created_at: string
          created_by_user_id: string
          id: string
          is_private: boolean
          note_type: string
          pinned: boolean
          property_id: string
          title: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "property_notes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_property_tasks: {
        Args: { property_id: string }
        Returns: {
          assigned_to_user_id: string | null
          created_at: string
          created_by_user_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          property_id: string
          status: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "property_tasks"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_property: {
        Args: { slug: string }
        Returns: {
          display_address: string
          featured_media_path: string
          gallery_paths: string[]
          id: string
          public_documents: string[]
          status: string
          uprn: string
        }[]
      }
      get_recent_activity: {
        Args: { auth_uid: string }
        Returns: {
          created_at: string
          event_type: string
          property_address: string
          property_id: string
        }[]
      }
      get_user_properties: {
        Args: { user_id?: string }
        Returns: {
          access_expires_at: string
          created_at: string
          display_address: string
          featured_media_id: string
          featured_media_mime_type: string
          featured_media_storage_path: string
          latitude: number
          longitude: number
          property_id: string
          role: string
          status: string
          uprn: string
        }[]
      }
      get_user_property_roles: {
        Args: { property_id: string }
        Returns: string[]
      }
      has_property_role: {
        Args: { allowed_roles: string[]; property_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_approved_for_property: {
        Args: { property_id: string }
        Returns: boolean
      }
      is_property_creator: { Args: { property_id: string }; Returns: boolean }
      is_property_owner: { Args: { property_id: string }; Returns: boolean }
      is_within_access_window: {
        Args: { property_id: string }
        Returns: boolean
      }
      regenerate_slug: { Args: { property_id: string }; Returns: string }
      search_properties: {
        Args: { query_text: string; result_limit?: number }
        Returns: {
          created_at: string
          display_address: string
          id: string
          latitude: number
          longitude: number
          relevance_score: number
          status: string
          uprn: string
        }[]
      }
      set_public_visibility: {
        Args: { property_id: string; visible: boolean }
        Returns: undefined
      }
      update_property_with_event: {
        Args: {
          p_display_address: string
          p_latitude?: number
          p_longitude?: number
          p_property_id: string
          p_status?: string
          p_uprn: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
