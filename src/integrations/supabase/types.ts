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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      act_matrix_entries: {
        Row: {
          avoidance_behaviours: string
          committed_actions: string
          created_at: string
          filled_by: string
          id: string
          internal_obstacles: string
          notes: string
          user_id: string
          values_text: string
        }
        Insert: {
          avoidance_behaviours?: string
          committed_actions?: string
          created_at?: string
          filled_by: string
          id?: string
          internal_obstacles?: string
          notes?: string
          user_id: string
          values_text?: string
        }
        Update: {
          avoidance_behaviours?: string
          committed_actions?: string
          created_at?: string
          filled_by?: string
          id?: string
          internal_obstacles?: string
          notes?: string
          user_id?: string
          values_text?: string
        }
        Relationships: []
      }
      calendar_shares: {
        Row: {
          can_view_focus: boolean
          can_view_sessions: boolean
          can_view_tasks: boolean
          created_at: string
          id: string
          owner_id: string
          shared_with_id: string
        }
        Insert: {
          can_view_focus?: boolean
          can_view_sessions?: boolean
          can_view_tasks?: boolean
          created_at?: string
          id?: string
          owner_id: string
          shared_with_id: string
        }
        Update: {
          can_view_focus?: boolean
          can_view_sessions?: boolean
          can_view_tasks?: boolean
          created_at?: string
          id?: string
          owner_id?: string
          shared_with_id?: string
        }
        Relationships: []
      }
      client_assignments: {
        Row: {
          assignee_id: string
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          assignee_id: string
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          assignee_id?: string
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          notes: string
          uploaded_by: string
        }
        Insert: {
          client_id: string
          created_at?: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          notes?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          notes?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      client_notes: {
        Row: {
          author_id: string
          category: string
          client_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          client_id: string
          content?: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_todos: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinical_entries: {
        Row: {
          client_id: string
          created_at: string
          entry_data: Json
          entry_date: string
          filled_by: string
          id: string
          notes: string
          tool_type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          entry_data?: Json
          entry_date?: string
          filled_by: string
          id?: string
          notes?: string
          tool_type: string
        }
        Update: {
          client_id?: string
          created_at?: string
          entry_data?: Json
          entry_date?: string
          filled_by?: string
          id?: string
          notes?: string
          tool_type?: string
        }
        Relationships: []
      }
      content_overrides: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          id: string
          image_url: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          image_url?: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          image_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string
          description: string
          display_order: number
          duration_minutes: number
          id: string
          is_preview: boolean
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          course_id: string
          id: string
          purchased_at: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string
          created_at: string
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          file_type?: string
          file_url: string
          id?: string
          lesson_id?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          is_subscription_included: boolean
          long_description: string
          price_cents: number
          slug: string
          stripe_price_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_subscription_included?: boolean
          long_description?: string
          price_cents?: number
          slug: string
          stripe_price_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_subscription_included?: boolean
          long_description?: string
          price_cents?: number
          slug?: string
          stripe_price_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          plan_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data?: Json
          plan_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          plan_date?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_blocks: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean
          recurrence_rule: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          interval_seconds: number
          is_active: boolean
          quote_author: string
          quote_text: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          interval_seconds?: number
          is_active?: boolean
          quote_author?: string
          quote_text?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          interval_seconds?: number
          is_active?: boolean
          quote_author?: string
          quote_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      service_options: {
        Row: {
          created_at: string
          description: string
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          attendee_ids: string[] | null
          client_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          meeting_platform: string | null
          meeting_url: string | null
          notes: string | null
          plaud_recording_id: string | null
          session_date: string
          status: string
          title: string
        }
        Insert: {
          attendee_ids?: string[] | null
          client_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_platform?: string | null
          meeting_url?: string | null
          notes?: string | null
          plaud_recording_id?: string | null
          session_date: string
          status?: string
          title: string
        }
        Update: {
          attendee_ids?: string[] | null
          client_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_platform?: string | null
          meeting_url?: string | null
          notes?: string | null
          plaud_recording_id?: string | null
          session_date?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_url: string
          page_key: string
          quote_author: string
          quote_text: string
          section_key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          page_key: string
          quote_author?: string
          quote_text?: string
          section_key?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          page_key?: string
          quote_author?: string
          quote_text?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_todos: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          credentials: string
          display_order: number
          id: string
          initials: string
          is_active: boolean
          name: string
          role: string
          signature_url: string | null
          slug: string | null
          social_linkedin: string
          social_twitter: string
          social_website: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string
          display_order?: number
          id?: string
          initials?: string
          is_active?: boolean
          name: string
          role?: string
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string
          display_order?: number
          id?: string
          initials?: string
          is_active?: boolean
          name?: string
          role?: string
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_requests: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          color: string
          created_at: string
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          estimated_minutes: number
          id: string
          is_completed: boolean
          labels: string[]
          priority: string
          project_id: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_completed?: boolean
          labels?: string[]
          priority?: string
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_completed?: boolean
          labels?: string[]
          priority?: string
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          _link?: string
          _message: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "team_member"
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
      app_role: ["admin", "client", "team_member"],
    },
  },
} as const
