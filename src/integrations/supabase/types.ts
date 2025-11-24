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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      brand_votes: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_votes_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "tequila_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      drink_specials: {
        Row: {
          created_at: string
          day_of_week: string
          description: string | null
          drink_name: string
          end_time: string | null
          id: string
          is_active: boolean
          regular_price: number | null
          restaurant_id: string
          special_price: number | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          description?: string | null
          drink_name: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          regular_price?: number | null
          restaurant_id: string
          special_price?: number | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          description?: string | null
          drink_name?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          regular_price?: number | null
          restaurant_id?: string
          special_price?: number | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drink_specials_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_checkins: {
        Row: {
          checked_in_at: string
          created_at: string
          guest_name: string | null
          id: string
          message: string | null
          party_id: string
          user_id: string | null
        }
        Insert: {
          checked_in_at?: string
          created_at?: string
          guest_name?: string | null
          id?: string
          message?: string | null
          party_id: string
          user_id?: string | null
        }
        Update: {
          checked_in_at?: string
          created_at?: string
          guest_name?: string | null
          id?: string
          message?: string | null
          party_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_checkins_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "party_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      party_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          latitude: number | null
          location_address: string | null
          location_name: string
          longitude: number | null
          photo_url: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_address?: string | null
          location_name: string
          longitude?: number | null
          photo_url: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_address?: string | null
          location_name?: string
          longitude?: number | null
          photo_url?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      party_posts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string
          party_date: string
          party_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location: string
          party_date: string
          party_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          party_date?: string
          party_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          agave_rating: number
          created_at: string
          id: string
          photo_urls: string[] | null
          price_point: number | null
          restaurant_id: string
          taste_notes: string | null
          updated_at: string
          user_id: string | null
          would_recommend: boolean
        }
        Insert: {
          agave_rating: number
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          price_point?: number | null
          restaurant_id: string
          taste_notes?: string | null
          updated_at?: string
          user_id?: string | null
          would_recommend?: boolean
        }
        Update: {
          agave_rating?: number
          created_at?: string
          id?: string
          photo_urls?: string[] | null
          price_point?: number | null
          restaurant_id?: string
          taste_notes?: string | null
          updated_at?: string
          user_id?: string | null
          would_recommend?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tequila_brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          submitted_by: string | null
          updated_at: string
          user_submitted: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          submitted_by?: string | null
          updated_at?: string
          user_submitted?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          submitted_by?: string | null
          updated_at?: string
          user_submitted?: boolean
        }
        Relationships: []
      }
      tequila_events: {
        Row: {
          contact_info: string | null
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          price: string | null
          title: string
          updated_at: string
          venue_address: string
          venue_name: string
          website: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          price?: string | null
          title: string
          updated_at?: string
          venue_address: string
          venue_name: string
          website?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          price?: string | null
          title?: string
          updated_at?: string
          venue_address?: string
          venue_name?: string
          website?: string | null
        }
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
    Enums: {},
  },
} as const
