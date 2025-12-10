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
      activity_log: {
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
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          checksum: string | null
          created_at: string
          created_by_user_id: string
          document_id: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          version: number
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          created_by_user_id: string
          document_id: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          version: number
        }
        Update: {
          checksum?: string | null
          created_at?: string
          created_by_user_id?: string
          document_id?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          checksum: string | null
          created_at: string
          deleted_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
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
          document_type?: Database["public"]["Enums"]["document_type"]
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
          document_type?: Database["public"]["Enums"]["document_type"]
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
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          id: string
          integration: Database["public"]["Enums"]["integration_type"]
          last_fetched_at: string | null
          payload: Json | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration: Database["public"]["Enums"]["integration_type"]
          last_fetched_at?: string | null
          payload?: Json | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          integration?: Database["public"]["Enums"]["integration_type"]
          last_fetched_at?: string | null
          payload?: Json | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          property_id: string | null
          property_permission:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_status:
            | Database["public"]["Enums"]["property_status_type"]
            | null
          role: Database["public"]["Enums"]["property_role_type"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          property_id?: string | null
          property_permission?:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_status?:
            | Database["public"]["Enums"]["property_status_type"]
            | null
          role: Database["public"]["Enums"]["property_role_type"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          property_id?: string | null
          property_permission?:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_status?:
            | Database["public"]["Enums"]["property_status_type"]
            | null
          role?: Database["public"]["Enums"]["property_role_type"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          checksum: string | null
          created_at: string
          deleted_at: string | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
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
          media_type?: Database["public"]["Enums"]["media_type"]
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
          media_type?: Database["public"]["Enums"]["media_type"]
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
            foreignKeyName: "media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      property_metadata: {
        Row: {
          created_at: string
          id: string
          meta_key: string
          meta_value: Json | null
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_key: string
          meta_value?: Json | null
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_key?: string
          meta_value?: Json | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_metadata_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_stakeholders: {
        Row: {
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          granted_at: string
          granted_by_user_id: string | null
          permission:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_id: string
          role: Database["public"]["Enums"]["property_role_type"]
          status: Database["public"]["Enums"]["property_status_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id?: string | null
          permission?:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_id: string
          role: Database["public"]["Enums"]["property_role_type"]
          status?: Database["public"]["Enums"]["property_status_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id?: string | null
          permission?:
            | Database["public"]["Enums"]["property_permission_type"]
            | null
          property_id?: string
          role?: Database["public"]["Enums"]["property_role_type"]
          status?: Database["public"]["Enums"]["property_status_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_stakeholders_granted_by_user_id_fkey"
            columns: ["granted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_stakeholders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_stakeholders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: Database["public"]["Enums"]["user_primary_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: Database["public"]["Enums"]["user_primary_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: Database["public"]["Enums"]["user_primary_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          created_by_user_id: string
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          organisation: string | null
          primary_role: Database["public"]["Enums"]["user_primary_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organisation?: string | null
          primary_role?: Database["public"]["Enums"]["user_primary_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organisation?: string | null
          primary_role?: Database["public"]["Enums"]["user_primary_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: undefined
      }
      calculate_property_completion: {
        Args: { property_id: string }
        Returns: number
      }
      can_delete: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      can_edit_property: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      can_invite: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      can_upload: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      can_view_property: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
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
        Args: { auth_uid?: string }
        Returns: {
          accessible_properties: number
          owned_properties: number
          total_documents: number
          total_media: number
        }[]
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
        Args: { auth_uid?: string }
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
          latitude: number
          longitude: number
          permission: Database["public"]["Enums"]["property_permission_type"]
          property_id: string
          public_visibility: boolean
          status: string
          statuses: Database["public"]["Enums"]["property_status_type"][]
          uprn: string
        }[]
      }
      grant_property_role: {
        Args: {
          expires_at?: string
          permission?: Database["public"]["Enums"]["property_permission_type"]
          property_id: string
          status?: Database["public"]["Enums"]["property_status_type"]
          target_user_id: string
        }
        Returns: undefined
      }
      has_property_role: {
        Args: { allowed_roles: string[]; property_id: string; user_id?: string }
        Returns: boolean
      }
      invite_user_to_property: {
        Args: {
          email: string
          expires_at?: string
          permission?: Database["public"]["Enums"]["property_permission_type"]
          property_id: string
          status?: Database["public"]["Enums"]["property_status_type"]
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_approved_for_property: {
        Args: { property_id: string }
        Returns: boolean
      }
      is_property_buyer: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      is_property_creator: { Args: { property_id: string }; Returns: boolean }
      is_property_editor: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      is_property_owner: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      is_property_stakeholder: {
        Args: { property_id: string }
        Returns: boolean
      }
      is_property_tenant: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      is_property_viewer: {
        Args: { property_id: string; user_id?: string }
        Returns: boolean
      }
      is_service_role: { Args: never; Returns: boolean }
      is_within_access_window: {
        Args: { property_id: string }
        Returns: boolean
      }
      regenerate_slug: { Args: { property_id: string }; Returns: string }
      revoke_property_role: {
        Args: {
          permission?: Database["public"]["Enums"]["property_permission_type"]
          property_id: string
          status?: Database["public"]["Enums"]["property_status_type"]
          target_user_id: string
        }
        Returns: undefined
      }
      role_for_property: {
        Args: { property_id: string }
        Returns: Database["public"]["Enums"]["property_permission_type"]
      }
      search_properties: {
        Args: { query_text: string; result_limit?: number }
        Returns: {
          display_address: string
          id: string
          latitude: number
          longitude: number
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
      document_type:
        | "title"
        | "survey"
        | "search"
        | "identity"
        | "contract"
        | "warranty"
        | "planning"
        | "compliance"
        | "other"
      event_type:
        | "created"
        | "updated"
        | "status_changed"
        | "document_uploaded"
        | "media_uploaded"
        | "note_added"
        | "task_created"
        | "flag_added"
        | "flag_resolved"
      integration_type:
        | "epc"
        | "hmlr"
        | "flood"
        | "postcodes"
        | "police"
        | "os"
        | "ons"
        | "other"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      media_type: "photo" | "video" | "floorplan" | "other"
      notification_type: "info" | "warning" | "action_required"
      property_permission_type: "editor" | "viewer"
      property_role_type: "owner" | "editor" | "viewer"
      property_status: "draft" | "active" | "archived"
      property_status_type: "owner" | "buyer" | "tenant"
      role_type:
        | "owner"
        | "buyer"
        | "agent"
        | "conveyancer"
        | "surveyor"
        | "admin"
        | "viewer"
      user_primary_role:
        | "consumer"
        | "agent"
        | "conveyancer"
        | "surveyor"
        | "admin"
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
    Enums: {
      document_type: [
        "title",
        "survey",
        "search",
        "identity",
        "contract",
        "warranty",
        "planning",
        "compliance",
        "other",
      ],
      event_type: [
        "created",
        "updated",
        "status_changed",
        "document_uploaded",
        "media_uploaded",
        "note_added",
        "task_created",
        "flag_added",
        "flag_resolved",
      ],
      integration_type: [
        "epc",
        "hmlr",
        "flood",
        "postcodes",
        "police",
        "os",
        "ons",
        "other",
      ],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      media_type: ["photo", "video", "floorplan", "other"],
      notification_type: ["info", "warning", "action_required"],
      property_permission_type: ["editor", "viewer"],
      property_role_type: ["owner", "editor", "viewer"],
      property_status: ["draft", "active", "archived"],
      property_status_type: ["owner", "buyer", "tenant"],
      role_type: [
        "owner",
        "buyer",
        "agent",
        "conveyancer",
        "surveyor",
        "admin",
        "viewer",
      ],
      user_primary_role: [
        "consumer",
        "agent",
        "conveyancer",
        "surveyor",
        "admin",
      ],
    },
  },
} as const
