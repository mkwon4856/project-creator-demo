/**
 * Database types — manually authored from supabase/schema.sql.
 *
 * To regenerate via Supabase CLI in the future:
 *   npx supabase gen types typescript --project-id <id> --schema public > src/lib/db.types.ts
 *
 * Hand-written until the project has a live Supabase instance.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─────────────────────────────────────────────────────────────
// Domain enums (kept in sync with CHECK constraints)
// ─────────────────────────────────────────────────────────────
export type ProfileRole = 'studio' | 'creator' | 'admin';
export type CreatorGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type CampaignStatus = 'draft' | 'recruiting' | 'live' | 'completed';
export type MissionType = 'shortform' | 'longform' | 'live';
export type ApplicationStatus = 'applied' | 'accepted' | 'rejected';
export type SubmissionStatus =
  | 'making'
  | 'review'
  | 'approved'
  | 'rejected'
  | 'paid';
export type PaymentStatus = 'pending' | 'completed';

// ─────────────────────────────────────────────────────────────
// JSON-typed columns (loose by default; tighten as the product evolves)
// ─────────────────────────────────────────────────────────────
export interface CampaignThumbnailJson {
  type?: 'url' | 'gradient';
  imageUrl?: string;
  from?: string;
  to?: string;
  emoji?: string;
}

export interface CampaignGuidelinesJson {
  do?: string[];
  dont?: string[];
  [key: string]: Json | undefined;
}

export type CreatorPlatform = 'youtube' | 'soop' | 'chzzk' | 'twitch';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: ProfileRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string;
          role?: ProfileRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: ProfileRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      studios: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'studios_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      creators: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          handle: string;
          grade: CreatorGrade;
          subscribers: number;
          avg_views: number;
          rating: number;
          completed_campaigns: number;
          is_verified: boolean;
          bio: string;
          platforms: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name: string;
          handle: string;
          grade?: CreatorGrade;
          subscribers?: number;
          avg_views?: number;
          rating?: number;
          completed_campaigns?: number;
          is_verified?: boolean;
          bio?: string;
          platforms?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string;
          handle?: string;
          grade?: CreatorGrade;
          subscribers?: number;
          avg_views?: number;
          rating?: number;
          completed_campaigns?: number;
          is_verified?: boolean;
          bio?: string;
          platforms?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'creators_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          studio_id: string;
          name: string;
          genre: string;
          developer: string;
          status: CampaignStatus;
          total_budget: number;
          spent_budget: number;
          target_creators: number;
          brief: string;
          hashtags: string[];
          guidelines: Json;
          thumbnail: Json;
          platform: string[];
          recruit_start: string | null;
          recruit_end: string | null;
          submit_deadline: string | null;
          payout_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          studio_id: string;
          name: string;
          genre?: string;
          developer?: string;
          status?: CampaignStatus;
          total_budget?: number;
          spent_budget?: number;
          target_creators?: number;
          brief?: string;
          hashtags?: string[];
          guidelines?: Json;
          thumbnail?: Json;
          platform?: string[];
          recruit_start?: string | null;
          recruit_end?: string | null;
          submit_deadline?: string | null;
          payout_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          studio_id?: string;
          name?: string;
          genre?: string;
          developer?: string;
          status?: CampaignStatus;
          total_budget?: number;
          spent_budget?: number;
          target_creators?: number;
          brief?: string;
          hashtags?: string[];
          guidelines?: Json;
          thumbnail?: Json;
          platform?: string[];
          recruit_start?: string | null;
          recruit_end?: string | null;
          submit_deadline?: string | null;
          payout_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_studio_id_fkey';
            columns: ['studio_id'];
            referencedRelation: 'studios';
            referencedColumns: ['id'];
          },
        ];
      };
      missions: {
        Row: {
          id: string;
          campaign_id: string;
          type: MissionType;
          enabled: boolean;
          rate_a: number;
          rate_b: number;
          rate_c: number;
          rate_d: number;
          rate_e: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          type: MissionType;
          enabled?: boolean;
          rate_a?: number;
          rate_b?: number;
          rate_c?: number;
          rate_d?: number;
          rate_e?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          type?: MissionType;
          enabled?: boolean;
          rate_a?: number;
          rate_b?: number;
          rate_c?: number;
          rate_d?: number;
          rate_e?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'missions_campaign_id_fkey';
            columns: ['campaign_id'];
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      applications: {
        Row: {
          id: string;
          creator_id: string;
          mission_id: string;
          campaign_id: string;
          status: ApplicationStatus;
          applied_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          mission_id: string;
          campaign_id: string;
          status?: ApplicationStatus;
          applied_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          mission_id?: string;
          campaign_id?: string;
          status?: ApplicationStatus;
          applied_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_creator_id_fkey';
            columns: ['creator_id'];
            referencedRelation: 'creators';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_mission_id_fkey';
            columns: ['mission_id'];
            referencedRelation: 'missions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_campaign_id_fkey';
            columns: ['campaign_id'];
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      submissions: {
        Row: {
          id: string;
          application_id: string;
          creator_id: string;
          campaign_id: string;
          content_url: string;
          status: SubmissionStatus;
          reward: number;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          application_id: string;
          creator_id: string;
          campaign_id: string;
          content_url: string;
          status?: SubmissionStatus;
          reward?: number;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          application_id?: string;
          creator_id?: string;
          campaign_id?: string;
          content_url?: string;
          status?: SubmissionStatus;
          reward?: number;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'submissions_application_id_fkey';
            columns: ['application_id'];
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'submissions_creator_id_fkey';
            columns: ['creator_id'];
            referencedRelation: 'creators';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'submissions_campaign_id_fkey';
            columns: ['campaign_id'];
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'submissions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          submission_id: string;
          creator_id: string;
          amount: number;
          platform_fee: number;
          status: PaymentStatus;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          submission_id: string;
          creator_id: string;
          amount?: number;
          platform_fee?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          submission_id?: string;
          creator_id?: string;
          amount?: number;
          platform_fee?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_submission_id_fkey';
            columns: ['submission_id'];
            referencedRelation: 'submissions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_creator_id_fkey';
            columns: ['creator_id'];
            referencedRelation: 'creators';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ─────────────────────────────────────────────────────────────
// Convenience aliases — `Tables<'campaigns'>` style
// ─────────────────────────────────────────────────────────────
type PublicTables = Database['public']['Tables'];

export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row'];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]['Update'];

export type Profile = Tables<'profiles'>;
export type Studio = Tables<'studios'>;
export type CreatorRow = Tables<'creators'>;
export type CampaignRow = Tables<'campaigns'>;
export type MissionRow = Tables<'missions'>;
export type ApplicationRow = Tables<'applications'>;
export type SubmissionRow = Tables<'submissions'>;
export type PaymentRow = Tables<'payments'>;
