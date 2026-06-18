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
      activity_feed: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_type: string
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_type?: string
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: []
      }
      ai_analyses: {
        Row: {
          analysis_type: string
          candidate_id: string | null
          content: string
          created_at: string
          error_message: string | null
          generation_time_ms: number | null
          id: string
          model_used: string | null
          regenerated_at: string | null
          regenerated_by: string | null
          result_id: string | null
          status: string
          team_member_id: string | null
          test_result_id: string
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string
        }
        Insert: {
          analysis_type: string
          candidate_id?: string | null
          content?: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          model_used?: string | null
          regenerated_at?: string | null
          regenerated_by?: string | null
          result_id?: string | null
          status?: string
          team_member_id?: string | null
          test_result_id: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          candidate_id?: string | null
          content?: string
          created_at?: string
          error_message?: string | null
          generation_time_ms?: number | null
          id?: string
          model_used?: string | null
          regenerated_at?: string | null
          regenerated_by?: string | null
          result_id?: string | null
          status?: string
          team_member_id?: string | null
          test_result_id?: string
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_regenerated_by_fkey"
            columns: ["regenerated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["result_id"]
          },
          {
            foreignKeyName: "ai_analyses_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_match_analyses: {
        Row: {
          algorithmic_score_snapshot: number | null
          candidate_id: string
          company_id: string
          content: string
          created_at: string
          generation_time_ms: number | null
          id: string
          job_id: string
          model_used: string | null
          tokens_input: number | null
          tokens_output: number | null
          usage_id: string
        }
        Insert: {
          algorithmic_score_snapshot?: number | null
          candidate_id: string
          company_id: string
          content: string
          created_at?: string
          generation_time_ms?: number | null
          id?: string
          job_id: string
          model_used?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          usage_id: string
        }
        Update: {
          algorithmic_score_snapshot?: number | null
          candidate_id?: string
          company_id?: string
          content?: string
          created_at?: string
          generation_time_ms?: number | null
          id?: string
          job_id?: string
          model_used?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          usage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_analyses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_analyses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_analyses_usage_id_fkey"
            columns: ["usage_id"]
            isOneToOne: false
            referencedRelation: "ai_match_usage"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_match_usage: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          job_id: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          id?: string
          job_id: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_usage_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_usage_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_usage_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      application_highlights: {
        Row: {
          application_id: string
          created_at: string
          id: string
          item_id: string
          item_type: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          item_id: string
          item_type: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_highlights_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string
          from_status: string | null
          id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by: string
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status: string
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean
          updated_at: string
        }
        Insert: {
          application_id: string
          author_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          updated_at?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes_history: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          new_content: string | null
          note_id: string
          previous_content: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          new_content?: string | null
          note_id: string
          previous_content?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          new_content?: string | null
          note_id?: string
          previous_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_notes_history_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "application_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string
          candidate_id: string
          id: string
          job_id: string
          message: string | null
          status: string
          test_deadline: string | null
          test_requested_at: string | null
          test_status: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          candidate_id: string
          id?: string
          job_id: string
          message?: string | null
          status?: string
          test_deadline?: string | null
          test_requested_at?: string | null
          test_status?: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          candidate_id?: string
          id?: string
          job_id?: string
          message?: string | null
          status?: string
          test_deadline?: string | null
          test_requested_at?: string | null
          test_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_categories: {
        Row: {
          created_at: string
          description: string | null
          dimension_id: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimension_id: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dimension_id?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_categories_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "assessment_dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_dimensions: {
        Row: {
          color: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      assessment_questions: {
        Row: {
          category_id: string
          code: string
          created_at: string
          help_text: string | null
          id: string
          is_active: boolean
          level: string
          options: Json | null
          red_flag_threshold: number | null
          text: string
          type: string
          updated_at: string
        }
        Insert: {
          category_id: string
          code: string
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          level?: string
          options?: Json | null
          red_flag_threshold?: number | null
          text: string
          type?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          code?: string
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          level?: string
          options?: Json | null
          red_flag_threshold?: number | null
          text?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "assessment_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          details: string | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_at: string
          performed_by: string | null
          performed_by_name: string | null
          permission_code: string | null
          target_group_id: string | null
          target_role_id: string | null
          target_user_id: string | null
          target_user_name: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
          permission_code?: string | null
          target_group_id?: string | null
          target_role_id?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
          permission_code?: string | null
          target_group_id?: string | null
          target_role_id?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_assessments: {
        Row: {
          answered_count: number
          candidate_id: string
          completed_at: string | null
          current_question_index: number
          expires_at: string | null
          id: string
          question_ids: string[] | null
          started_at: string
          status: string
          total_questions: number
        }
        Insert: {
          answered_count?: number
          candidate_id: string
          completed_at?: string | null
          current_question_index?: number
          expires_at?: string | null
          id?: string
          question_ids?: string[] | null
          started_at?: string
          status?: string
          total_questions?: number
        }
        Update: {
          answered_count?: number
          candidate_id?: string
          completed_at?: string | null
          current_question_index?: number
          expires_at?: string | null
          id?: string
          question_ids?: string[] | null
          started_at?: string
          status?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_responses: {
        Row: {
          answered_at: string
          assessment_id: string
          id: string
          question_id: string
          response: string
          score: number
          time_spent_seconds: number
        }
        Insert: {
          answered_at?: string
          assessment_id: string
          id?: string
          question_id: string
          response: string
          score?: number
          time_spent_seconds?: number
        }
        Update: {
          answered_at?: string
          assessment_id?: string
          id?: string
          question_id?: string
          response?: string
          score?: number
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "behavioral_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_results: {
        Row: {
          assessment_id: string
          badge_awarded: string | null
          candidate_id: string
          career_recommendations: string[] | null
          category_scores: Json | null
          character_score: number
          competency_score: number
          development_areas: string[] | null
          generated_at: string
          id: string
          insights: Json | null
          overall_score: number
          personality_score: number
          red_flags: Json | null
          strengths: string[] | null
          summary: string | null
          xp_awarded: number
        }
        Insert: {
          assessment_id: string
          badge_awarded?: string | null
          candidate_id: string
          career_recommendations?: string[] | null
          category_scores?: Json | null
          character_score?: number
          competency_score?: number
          development_areas?: string[] | null
          generated_at?: string
          id?: string
          insights?: Json | null
          overall_score?: number
          personality_score?: number
          red_flags?: Json | null
          strengths?: string[] | null
          summary?: string | null
          xp_awarded?: number
        }
        Update: {
          assessment_id?: string
          badge_awarded?: string | null
          candidate_id?: string
          career_recommendations?: string[] | null
          category_scores?: Json | null
          character_score?: number
          competency_score?: number
          development_areas?: string[] | null
          generated_at?: string
          id?: string
          insights?: Json | null
          overall_score?: number
          personality_score?: number
          red_flags?: Json | null
          strengths?: string[] | null
          summary?: string | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "behavioral_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_tests: {
        Row: {
          candidate_id: string
          candidate_name: string | null
          company_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          job_id: string | null
          result: Json | null
          sent_at: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          candidate_name?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          result?: Json | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          candidate_name?: string | null
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          result?: Json | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_tests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_tests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_tests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes: {
        Row: {
          author_id: string
          candidate_id: string
          company_id: string
          content: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean
          updated_at: string
        }
        Insert: {
          author_id: string
          candidate_id: string
          company_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          updated_at?: string
        }
        Update: {
          author_id?: string
          candidate_id?: string
          company_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_notes_history: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          new_content: string | null
          note_id: string
          previous_content: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          new_content?: string | null
          note_id: string
          previous_content?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          new_content?: string | null
          note_id?: string
          previous_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_notes_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_notes_history_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "candidate_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_standardized_skills: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          priority: number
          skill_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          priority?: number
          skill_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          priority?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_standardized_skills_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_standardized_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "standardized_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          about: string | null
          anonymous_id: string | null
          availability: string | null
          avatar_url: string | null
          city: string | null
          contract_type: string[] | null
          cpf: string | null
          created_at: string | null
          date_of_birth: string | null
          deactivated_at: string | null
          display_name: string | null
          education: string | null
          email: string
          experience_years: number | null
          gender: string | null
          has_test: boolean | null
          id: string
          lgpd_consent_at: string | null
          linkedin: string | null
          location: string | null
          marital_status: string | null
          name: string
          nationality: string | null
          onboarding_step: string | null
          open_to_relocation: boolean | null
          phone: string | null
          plan: string | null
          preferred_roles: string[] | null
          preferred_sectors: string[] | null
          privacy_accepted_at: string | null
          profile_completion: number | null
          profile_id: string
          resume_visibility: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_negotiable: boolean | null
          show_salary_expectation: boolean | null
          skill_migration_note: Json | null
          skills: string[] | null
          state: string | null
          status: string | null
          stripe_customer_id_live: string | null
          stripe_customer_id_test: string | null
          terms_accepted_at: string | null
          title: string | null
          updated_at: string | null
          visibility_locked: boolean
          visibility_mode: string | null
          work_model: string[] | null
        }
        Insert: {
          about?: string | null
          anonymous_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          city?: string | null
          contract_type?: string[] | null
          cpf?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deactivated_at?: string | null
          display_name?: string | null
          education?: string | null
          email: string
          experience_years?: number | null
          gender?: string | null
          has_test?: boolean | null
          id?: string
          lgpd_consent_at?: string | null
          linkedin?: string | null
          location?: string | null
          marital_status?: string | null
          name: string
          nationality?: string | null
          onboarding_step?: string | null
          open_to_relocation?: boolean | null
          phone?: string | null
          plan?: string | null
          preferred_roles?: string[] | null
          preferred_sectors?: string[] | null
          privacy_accepted_at?: string | null
          profile_completion?: number | null
          profile_id: string
          resume_visibility?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          show_salary_expectation?: boolean | null
          skill_migration_note?: Json | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          stripe_customer_id_live?: string | null
          stripe_customer_id_test?: string | null
          terms_accepted_at?: string | null
          title?: string | null
          updated_at?: string | null
          visibility_locked?: boolean
          visibility_mode?: string | null
          work_model?: string[] | null
        }
        Update: {
          about?: string | null
          anonymous_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          city?: string | null
          contract_type?: string[] | null
          cpf?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deactivated_at?: string | null
          display_name?: string | null
          education?: string | null
          email?: string
          experience_years?: number | null
          gender?: string | null
          has_test?: boolean | null
          id?: string
          lgpd_consent_at?: string | null
          linkedin?: string | null
          location?: string | null
          marital_status?: string | null
          name?: string
          nationality?: string | null
          onboarding_step?: string | null
          open_to_relocation?: boolean | null
          phone?: string | null
          plan?: string | null
          preferred_roles?: string[] | null
          preferred_sectors?: string[] | null
          privacy_accepted_at?: string | null
          profile_completion?: number | null
          profile_id?: string
          resume_visibility?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          show_salary_expectation?: boolean | null
          skill_migration_note?: Json | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          stripe_customer_id_live?: string | null
          stripe_customer_id_test?: string | null
          terms_accepted_at?: string | null
          title?: string | null
          updated_at?: string | null
          visibility_locked?: boolean
          visibility_mode?: string | null
          work_model?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_knowledge: {
        Row: {
          answer: string
          category: string
          id: string
          is_active: boolean
          keywords: string[] | null
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category?: string
          id?: string
          is_active?: boolean
          keywords?: string[] | null
          question?: string
          sort_order?: number
        }
        Relationships: []
      }
      companies: {
        Row: {
          active_jobs: number | null
          address: string | null
          bairro: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string | null
          deactivated_at: string | null
          description: string | null
          id: string
          industry: string | null
          linkedin: string | null
          location: string | null
          logo_url: string | null
          logradouro: string | null
          name: string
          nome_fantasia: string | null
          numero: string | null
          payment_status: string | null
          phone: string | null
          plan: string | null
          profile_id: string
          razao_social: string | null
          situacao_cadastral: string | null
          size: string | null
          state: string | null
          status: string | null
          stripe_customer_id_live: string | null
          stripe_customer_id_test: string | null
          total_candidates: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active_jobs?: number | null
          address?: string | null
          bairro?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          location?: string | null
          logo_url?: string | null
          logradouro?: string | null
          name: string
          nome_fantasia?: string | null
          numero?: string | null
          payment_status?: string | null
          phone?: string | null
          plan?: string | null
          profile_id: string
          razao_social?: string | null
          situacao_cadastral?: string | null
          size?: string | null
          state?: string | null
          status?: string | null
          stripe_customer_id_live?: string | null
          stripe_customer_id_test?: string | null
          total_candidates?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active_jobs?: number | null
          address?: string | null
          bairro?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          linkedin?: string | null
          location?: string | null
          logo_url?: string | null
          logradouro?: string | null
          name?: string
          nome_fantasia?: string | null
          numero?: string | null
          payment_status?: string | null
          phone?: string | null
          plan?: string | null
          profile_id?: string
          razao_social?: string | null
          situacao_cadastral?: string | null
          size?: string | null
          state?: string | null
          status?: string | null
          stripe_customer_id_live?: string | null
          stripe_customer_id_test?: string | null
          total_candidates?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_cultural_profiles: {
        Row: {
          collaboration: number
          company_id: string
          created_at: string
          description: string | null
          direction: number
          hierarchy: number
          id: string
          innovation: number
          pace: number
          updated_at: string
          values: string[]
        }
        Insert: {
          collaboration?: number
          company_id: string
          created_at?: string
          description?: string | null
          direction?: number
          hierarchy?: number
          id?: string
          innovation?: number
          pace?: number
          updated_at?: string
          values?: string[]
        }
        Update: {
          collaboration?: number
          company_id?: string
          created_at?: string
          description?: string | null
          direction?: number
          hierarchy?: number
          id?: string
          innovation?: number
          pace?: number
          updated_at?: string
          values?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "company_cultural_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_invites: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_tests: {
        Row: {
          activated_at: string | null
          archived_at: string | null
          closed_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          default_expiration_days: number
          description: string | null
          id: string
          instructions: string | null
          job_id: string | null
          job_title: string | null
          name: string
          public_link_active: boolean | null
          public_link_slug: string | null
          status: string
          target_audience: string
          template_id: string
          updated_at: string
          weights: Json
        }
        Insert: {
          activated_at?: string | null
          archived_at?: string | null
          closed_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          default_expiration_days?: number
          description?: string | null
          id?: string
          instructions?: string | null
          job_id?: string | null
          job_title?: string | null
          name: string
          public_link_active?: boolean | null
          public_link_slug?: string | null
          status?: string
          target_audience?: string
          template_id: string
          updated_at?: string
          weights?: Json
        }
        Update: {
          activated_at?: string | null
          archived_at?: string | null
          closed_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          default_expiration_days?: number
          description?: string | null
          id?: string
          instructions?: string | null
          job_id?: string | null
          job_title?: string | null
          name?: string
          public_link_active?: boolean | null
          public_link_slug?: string | null
          status?: string
          target_audience?: string
          template_id?: string
          updated_at?: string
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "company_tests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_tests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_by: string | null
          job_title: string | null
          onboarding_step: string
          profile_id: string
          role: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          onboarding_step?: string
          profile_id: string
          role?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          job_title?: string | null
          onboarding_step?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          job_id: string | null
          unread_count: number
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          unread_count?: number
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cultural_dimensions: {
        Row: {
          description: string | null
          id: string
          key: string
          mapping: Json | null
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          mapping?: Json | null
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          mapping?: Json | null
          name?: string
        }
        Relationships: []
      }
      curriculum_courses: {
        Row: {
          certificate_file_name: string | null
          certificate_type: string | null
          certificate_url: string | null
          curriculum_id: string
          hours: number | null
          id: string
          institution: string
          name: string
          year: number | null
        }
        Insert: {
          certificate_file_name?: string | null
          certificate_type?: string | null
          certificate_url?: string | null
          curriculum_id: string
          hours?: number | null
          id?: string
          institution: string
          name: string
          year?: number | null
        }
        Update: {
          certificate_file_name?: string | null
          certificate_type?: string | null
          certificate_url?: string | null
          curriculum_id?: string
          hours?: number | null
          id?: string
          institution?: string
          name?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_courses_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_education: {
        Row: {
          curriculum_id: string
          degree: string
          end_year: string | null
          field: string | null
          id: string
          institution: string
          sort_order: number
          start_year: string | null
          status: string | null
        }
        Insert: {
          curriculum_id: string
          degree: string
          end_year?: string | null
          field?: string | null
          id?: string
          institution: string
          sort_order?: number
          start_year?: string | null
          status?: string | null
        }
        Update: {
          curriculum_id?: string
          degree?: string
          end_year?: string | null
          field?: string | null
          id?: string
          institution?: string
          sort_order?: number
          start_year?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_education_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_experiences: {
        Row: {
          company: string
          curriculum_id: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          role: string
          sort_order: number
          start_date: string
        }
        Insert: {
          company: string
          curriculum_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          role: string
          sort_order?: number
          start_date: string
        }
        Update: {
          company?: string
          curriculum_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          role?: string
          sort_order?: number
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_experiences_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_skills: {
        Row: {
          curriculum_id: string
          id: string
          level: string | null
          name: string
          type: string | null
        }
        Insert: {
          curriculum_id: string
          id?: string
          level?: string | null
          name: string
          type?: string | null
        }
        Update: {
          curriculum_id?: string
          id?: string
          level?: string | null
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_skills_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "curriculums"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculums: {
        Row: {
          about: string | null
          availability: string | null
          candidate_id: string
          city: string | null
          contract_type: string[] | null
          created_at: string
          education_level: string | null
          education_level_status: string | null
          email: string | null
          id: string
          is_archived: boolean
          is_default: boolean
          is_first_job: boolean | null
          linkedin: string | null
          location: string | null
          name: string
          open_to_relocation: boolean | null
          phone: string | null
          preferred_roles: string[] | null
          preferred_sectors: string[] | null
          presentation_video_name: string | null
          presentation_video_type: string | null
          presentation_video_url: string | null
          resume_pdf_name: string | null
          resume_pdf_size: number | null
          resume_pdf_uploaded_at: string | null
          resume_pdf_url: string | null
          salary_max: number | null
          salary_min: number | null
          salary_negotiable: boolean | null
          state: string | null
          title: string | null
          updated_at: string
          work_model: string[] | null
        }
        Insert: {
          about?: string | null
          availability?: string | null
          candidate_id: string
          city?: string | null
          contract_type?: string[] | null
          created_at?: string
          education_level?: string | null
          education_level_status?: string | null
          email?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          is_first_job?: boolean | null
          linkedin?: string | null
          location?: string | null
          name?: string
          open_to_relocation?: boolean | null
          phone?: string | null
          preferred_roles?: string[] | null
          preferred_sectors?: string[] | null
          presentation_video_name?: string | null
          presentation_video_type?: string | null
          presentation_video_url?: string | null
          resume_pdf_name?: string | null
          resume_pdf_size?: number | null
          resume_pdf_uploaded_at?: string | null
          resume_pdf_url?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          state?: string | null
          title?: string | null
          updated_at?: string
          work_model?: string[] | null
        }
        Update: {
          about?: string | null
          availability?: string | null
          candidate_id?: string
          city?: string | null
          contract_type?: string[] | null
          created_at?: string
          education_level?: string | null
          education_level_status?: string | null
          email?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          is_first_job?: boolean | null
          linkedin?: string | null
          location?: string | null
          name?: string
          open_to_relocation?: boolean | null
          phone?: string | null
          preferred_roles?: string[] | null
          preferred_sectors?: string[] | null
          presentation_video_name?: string | null
          presentation_video_type?: string | null
          presentation_video_url?: string | null
          resume_pdf_name?: string | null
          resume_pdf_size?: number | null
          resume_pdf_uploaded_at?: string | null
          resume_pdf_url?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          state?: string | null
          title?: string | null
          updated_at?: string
          work_model?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculums_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_settings: {
        Row: {
          company_id: string
          id: string
          retention_years: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          id?: string
          retention_years?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          id?: string
          retention_years?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_retention_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      development_objectives: {
        Row: {
          created_at: string
          description: string | null
          dimension: string | null
          due_date: string | null
          id: string
          notes: string | null
          plan_id: string
          priority: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dimension?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          plan_id: string
          priority?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dimension?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          plan_id?: string
          priority?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_objectives_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "development_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      development_plans: {
        Row: {
          created_at: string
          id: string
          member_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "development_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_annotations: {
        Row: {
          created_at: string
          date: string
          id: string
          member_id: string
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          member_id: string
          text: string
          type?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          member_id?: string
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolution_annotations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_audit: {
        Row: {
          action: string
          details: string | null
          flag_key: string
          flag_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_at: string
          performed_by: string | null
          performed_by_name: string | null
        }
        Insert: {
          action: string
          details?: string | null
          flag_key: string
          flag_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          flag_key?: string
          flag_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          enabled: boolean
          flag_key: string
          id: string
          reason: string | null
          target_id: string
          target_name: string | null
          target_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          enabled: boolean
          flag_key: string
          id?: string
          reason?: string | null
          target_id: string
          target_name?: string | null
          target_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          flag_key?: string
          id?: string
          reason?: string | null
          target_id?: string
          target_name?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flag_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flag_overrides_flag_key_fkey"
            columns: ["flag_key"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["key"]
          },
        ]
      }
      feature_flags: {
        Row: {
          category: string
          condition_groups: Json | null
          created_at: string
          default_value: boolean
          description: string | null
          id: string
          is_kill_switched: boolean
          key: string
          kill_switch_reason: string | null
          kill_switched_at: string | null
          kill_switched_by: string | null
          name: string
          rollout_percentage: number | null
          scope: string
          status: string
          updated_at: string
        }
        Insert: {
          category?: string
          condition_groups?: Json | null
          created_at?: string
          default_value?: boolean
          description?: string | null
          id?: string
          is_kill_switched?: boolean
          key: string
          kill_switch_reason?: string | null
          kill_switched_at?: string | null
          kill_switched_by?: string | null
          name: string
          rollout_percentage?: number | null
          scope?: string
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          condition_groups?: Json | null
          created_at?: string
          default_value?: boolean
          description?: string | null
          id?: string
          is_kill_switched?: boolean
          key?: string
          kill_switch_reason?: string | null
          kill_switched_at?: string | null
          kill_switched_by?: string | null
          name?: string
          rollout_percentage?: number | null
          scope?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_kill_switched_by_fkey"
            columns: ["kill_switched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_badges: {
        Row: {
          category: string
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          category?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: []
      }
      gamification_levels: {
        Row: {
          bg_color: string | null
          color: string | null
          icon: string | null
          id: number
          max_xp: number
          min_xp: number
          name: string
        }
        Insert: {
          bg_color?: string | null
          color?: string | null
          icon?: string | null
          id: number
          max_xp: number
          min_xp: number
          name: string
        }
        Update: {
          bg_color?: string | null
          color?: string | null
          icon?: string | null
          id?: number
          max_xp?: number
          min_xp?: number
          name?: string
        }
        Relationships: []
      }
      gamification_xp_actions: {
        Row: {
          description: string | null
          max_per_day: number | null
          type: string
          xp: number
        }
        Insert: {
          description?: string | null
          max_per_day?: number | null
          type: string
          xp?: number
        }
        Update: {
          description?: string | null
          max_per_day?: number | null
          type?: string
          xp?: number
        }
        Relationships: []
      }
      gauge_pro_archetypes: {
        Row: {
          communication_style: string | null
          created_at: string
          description: string | null
          development_areas: string[] | null
          id: string
          ideal_roles: string[] | null
          is_active: boolean
          name: string
          strengths: string[] | null
          updated_at: string
          work_style: string | null
        }
        Insert: {
          communication_style?: string | null
          created_at?: string
          description?: string | null
          development_areas?: string[] | null
          id: string
          ideal_roles?: string[] | null
          is_active?: boolean
          name: string
          strengths?: string[] | null
          updated_at?: string
          work_style?: string | null
        }
        Update: {
          communication_style?: string | null
          created_at?: string
          description?: string | null
          development_areas?: string[] | null
          id?: string
          ideal_roles?: string[] | null
          is_active?: boolean
          name?: string
          strengths?: string[] | null
          updated_at?: string
          work_style?: string | null
        }
        Relationships: []
      }
      gauge_pro_assessments: {
        Row: {
          candidate_id: string | null
          completed_at: string | null
          current_scenario_index: number
          current_word_step: number
          id: string
          part1_completed_at: string | null
          part1_started_at: string | null
          part2_completed_at: string | null
          part2_started_at: string | null
          phase: string
          scenario_responses: Json | null
          shuffled_word_orders: Json | null
          started_at: string
          team_member_id: string | null
          word_step_responses: Json | null
        }
        Insert: {
          candidate_id?: string | null
          completed_at?: string | null
          current_scenario_index?: number
          current_word_step?: number
          id?: string
          part1_completed_at?: string | null
          part1_started_at?: string | null
          part2_completed_at?: string | null
          part2_started_at?: string | null
          phase?: string
          scenario_responses?: Json | null
          shuffled_word_orders?: Json | null
          started_at?: string
          team_member_id?: string | null
          word_step_responses?: Json | null
        }
        Update: {
          candidate_id?: string | null
          completed_at?: string | null
          current_scenario_index?: number
          current_word_step?: number
          id?: string
          part1_completed_at?: string | null
          part1_started_at?: string | null
          part2_completed_at?: string | null
          part2_started_at?: string | null
          phase?: string
          scenario_responses?: Json | null
          shuffled_word_orders?: Json | null
          started_at?: string
          team_member_id?: string | null
          word_step_responses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "gauge_pro_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gauge_pro_assessments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gauge_pro_results: {
        Row: {
          archetype: Json | null
          archetype_id: string | null
          assessment_id: string
          badge_awarded: string | null
          candidate_id: string | null
          career_recommendations: string[] | null
          classifications: Json | null
          development_areas: string[] | null
          final_scores: Json | null
          generated_at: string
          id: string
          invitation_id: string | null
          part1_scores: Json | null
          part2_scores: Json | null
          primary_dimension: string | null
          secondary_dimension: string | null
          strengths: string[] | null
          team_member_id: string | null
          xp_awarded: number
        }
        Insert: {
          archetype?: Json | null
          archetype_id?: string | null
          assessment_id: string
          badge_awarded?: string | null
          candidate_id?: string | null
          career_recommendations?: string[] | null
          classifications?: Json | null
          development_areas?: string[] | null
          final_scores?: Json | null
          generated_at?: string
          id?: string
          invitation_id?: string | null
          part1_scores?: Json | null
          part2_scores?: Json | null
          primary_dimension?: string | null
          secondary_dimension?: string | null
          strengths?: string[] | null
          team_member_id?: string | null
          xp_awarded?: number
        }
        Update: {
          archetype?: Json | null
          archetype_id?: string | null
          assessment_id?: string
          badge_awarded?: string | null
          candidate_id?: string | null
          career_recommendations?: string[] | null
          classifications?: Json | null
          development_areas?: string[] | null
          final_scores?: Json | null
          generated_at?: string
          id?: string
          invitation_id?: string | null
          part1_scores?: Json | null
          part2_scores?: Json | null
          primary_dimension?: string | null
          secondary_dimension?: string | null
          strengths?: string[] | null
          team_member_id?: string | null
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "gauge_pro_results_archetype_id_fkey"
            columns: ["archetype_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_archetypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gauge_pro_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gauge_pro_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["assessment_uuid"]
          },
          {
            foreignKeyName: "gauge_pro_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gauge_pro_results_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "test_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gauge_pro_results_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["invitation_id"]
          },
          {
            foreignKeyName: "gauge_pro_results_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      gauge_pro_scenarios: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          options: Json
          situation: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          options?: Json
          situation: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          options?: Json
          situation?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gauge_pro_words: {
        Row: {
          created_at: string
          dimension: string
          id: number
          is_active: boolean
          polarity: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dimension: string
          id?: number
          is_active?: boolean
          polarity: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dimension?: string
          id?: number
          is_active?: boolean
          polarity?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      hirings: {
        Row: {
          application_id: string
          candidate_id: string
          company_id: string
          created_at: string
          days_in_pipeline: number | null
          days_to_fill: number | null
          department_id: string
          gauge_pro_status: string | null
          hire_date: string
          hired_by: string
          id: string
          job_id: string
          match_score: number | null
          notes: string | null
          pipeline_stages_count: number | null
          position_title: string
          salary: number | null
          team_member_id: string | null
        }
        Insert: {
          application_id: string
          candidate_id: string
          company_id: string
          created_at?: string
          days_in_pipeline?: number | null
          days_to_fill?: number | null
          department_id: string
          gauge_pro_status?: string | null
          hire_date: string
          hired_by: string
          id?: string
          job_id: string
          match_score?: number | null
          notes?: string | null
          pipeline_stages_count?: number | null
          position_title: string
          salary?: number | null
          team_member_id?: string | null
        }
        Update: {
          application_id?: string
          candidate_id?: string
          company_id?: string
          created_at?: string
          days_in_pipeline?: number | null
          days_to_fill?: number | null
          department_id?: string
          gauge_pro_status?: string | null
          hire_date?: string
          hired_by?: string
          id?: string
          job_id?: string
          match_score?: number | null
          notes?: string | null
          pipeline_stages_count?: number | null
          position_title?: string
          salary?: number | null
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hirings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_hired_by_fkey"
            columns: ["hired_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hirings_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      impersonation_sessions: {
        Row: {
          admin_id: string
          ended_at: string | null
          expires_at: string
          id: string
          reason: string
          started_at: string
          target_user_id: string
          target_user_type: string
        }
        Insert: {
          admin_id: string
          ended_at?: string | null
          expires_at: string
          id?: string
          reason: string
          started_at?: string
          target_user_id: string
          target_user_type: string
        }
        Update: {
          admin_id?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          reason?: string
          started_at?: string
          target_user_id?: string
          target_user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "impersonation_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impersonation_sessions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          address: string | null
          application_id: string | null
          cancellation_details: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          candidate_id: string
          company_id: string
          company_name: string | null
          completed_at: string | null
          confirmed_at: string | null
          confirmed_datetime: string | null
          created_at: string
          duration: number
          id: string
          interviewer_name: string | null
          interviewer_role: string | null
          job_id: string
          job_title: string | null
          map_link: string | null
          notes: string | null
          phone_number: string | null
          proposed_slots: Json | null
          response_deadline: string | null
          status: string
          suggested_slots: Json | null
          suggestion_reason: string | null
          title: string
          type: string
          updated_at: string
          video_link: string | null
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          cancellation_details?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          candidate_id: string
          company_id: string
          company_name?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_datetime?: string | null
          created_at?: string
          duration?: number
          id?: string
          interviewer_name?: string | null
          interviewer_role?: string | null
          job_id: string
          job_title?: string | null
          map_link?: string | null
          notes?: string | null
          phone_number?: string | null
          proposed_slots?: Json | null
          response_deadline?: string | null
          status?: string
          suggested_slots?: Json | null
          suggestion_reason?: string | null
          title: string
          type?: string
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          address?: string | null
          application_id?: string | null
          cancellation_details?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          candidate_id?: string
          company_id?: string
          company_name?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_datetime?: string | null
          created_at?: string
          duration?: number
          id?: string
          interviewer_name?: string | null
          interviewer_role?: string | null
          job_id?: string
          job_title?: string | null
          map_link?: string | null
          notes?: string | null
          phone_number?: string | null
          proposed_slots?: Json | null
          response_deadline?: string | null
          status?: string
          suggested_slots?: Json | null
          suggestion_reason?: string | null
          title?: string
          type?: string
          updated_at?: string
          video_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assessment_invites: {
        Row: {
          candidate_id: string | null
          completed_at: string | null
          created_at: string
          expires_at: string
          external_email: string | null
          external_name: string | null
          id: string
          job_assessment_id: string
          magic_token: string | null
          sent_at: string
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at: string
          external_email?: string | null
          external_name?: string | null
          id?: string
          job_assessment_id: string
          magic_token?: string | null
          sent_at?: string
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          external_email?: string | null
          external_name?: string | null
          id?: string
          job_assessment_id?: string
          magic_token?: string | null
          sent_at?: string
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assessment_invites_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assessment_invites_job_assessment_id_fkey"
            columns: ["job_assessment_id"]
            isOneToOne: false
            referencedRelation: "job_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assessment_results: {
        Row: {
          ai_analysis: Json
          ai_recommendation: string | null
          candidate_email: string | null
          candidate_id: string | null
          candidate_name: string | null
          competency_scores: Json
          created_at: string
          id: string
          invite_id: string
          job_assessment_id: string
          overall_score: number
          recruiter_adjustments: Json | null
          recruiter_decision: string | null
          recruiter_notes: string | null
          red_flags: Json
          responses: Json
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json
          ai_recommendation?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          competency_scores?: Json
          created_at?: string
          id?: string
          invite_id: string
          job_assessment_id: string
          overall_score?: number
          recruiter_adjustments?: Json | null
          recruiter_decision?: string | null
          recruiter_notes?: string | null
          red_flags?: Json
          responses?: Json
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json
          ai_recommendation?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          competency_scores?: Json
          created_at?: string
          id?: string
          invite_id?: string
          job_assessment_id?: string
          overall_score?: number
          recruiter_adjustments?: Json | null
          recruiter_decision?: string | null
          recruiter_notes?: string | null
          red_flags?: Json
          responses?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assessment_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assessment_results_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "job_assessment_invites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assessment_results_job_assessment_id_fkey"
            columns: ["job_assessment_id"]
            isOneToOne: false
            referencedRelation: "job_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assessments: {
        Row: {
          company_id: string
          competencies: Json
          created_at: string
          created_by: string
          estimated_minutes: number
          expiration_days: number
          id: string
          job_id: string
          questions_ids: string[]
          status: string
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          company_id: string
          competencies?: Json
          created_at?: string
          created_by: string
          estimated_minutes?: number
          expiration_days?: number
          id?: string
          job_id: string
          questions_ids?: string[]
          status?: string
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          competencies?: Json
          created_at?: string
          created_by?: string
          estimated_minutes?: number
          expiration_days?: number
          id?: string
          job_id?: string
          questions_ids?: string[]
          status?: string
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assessments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_standardized_skills: {
        Row: {
          created_at: string
          id: string
          job_id: string
          priority: number
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          priority?: number
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          priority?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_standardized_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_standardized_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "standardized_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          admin_notes: string | null
          applications_count: number
          area: string | null
          benefits: string[] | null
          city: string | null
          company_id: string
          correction_fields: string[] | null
          created_at: string
          description: string
          finalization_reason: string | null
          finalized_at: string | null
          highlighted_until: string | null
          id: string
          is_anonymous: boolean
          is_highlighted: boolean
          level: string | null
          location: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string
          positions_count: number
          published_at: string | null
          rejection_reason: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          state: string | null
          status: string
          title: string
          type: string
          updated_at: string
          weight_experience: number
          weight_gauge_pro: number
          weight_location: number
          weight_skills_behavioral: number
          weight_skills_technical: number
        }
        Insert: {
          admin_notes?: string | null
          applications_count?: number
          area?: string | null
          benefits?: string[] | null
          city?: string | null
          company_id: string
          correction_fields?: string[] | null
          created_at?: string
          description?: string
          finalization_reason?: string | null
          finalized_at?: string | null
          highlighted_until?: string | null
          id?: string
          is_anonymous?: boolean
          is_highlighted?: boolean
          level?: string | null
          location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          positions_count?: number
          published_at?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          weight_experience?: number
          weight_gauge_pro?: number
          weight_location?: number
          weight_skills_behavioral?: number
          weight_skills_technical?: number
        }
        Update: {
          admin_notes?: string | null
          applications_count?: number
          area?: string | null
          benefits?: string[] | null
          city?: string | null
          company_id?: string
          correction_fields?: string[] | null
          created_at?: string
          description?: string
          finalization_reason?: string | null
          finalized_at?: string | null
          highlighted_until?: string | null
          id?: string
          is_anonymous?: boolean
          is_highlighted?: boolean
          level?: string | null
          location?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          positions_count?: number
          published_at?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          state?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          weight_experience?: number
          weight_gauge_pro?: number
          weight_location?: number
          weight_skills_behavioral?: number
          weight_skills_technical?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs_weight_history: {
        Row: {
          active_applications_count: number
          changed_at: string
          changed_by: string | null
          id: string
          job_id: string
          new_weights: Json
          old_weights: Json
          reason: string | null
        }
        Insert: {
          active_applications_count?: number
          changed_at?: string
          changed_by?: string | null
          id?: string
          job_id: string
          new_weights: Json
          old_weights: Json
          reason?: string | null
        }
        Update: {
          active_applications_count?: number
          changed_at?: string
          changed_by?: string | null
          id?: string
          job_id?: string
          new_weights?: Json
          old_weights?: Json
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_weight_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_weight_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          category: string
          id: string
          is_active: boolean
          key: string
          name: string
          subject: string | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          subject?: string | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          subject?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          read: boolean
          receiver_id: string | null
          receiver_name: string | null
          sender_id: string
          sender_name: string | null
          sender_type: string
          subject: string | null
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          receiver_id?: string | null
          receiver_name?: string | null
          sender_id: string
          sender_name?: string | null
          sender_type: string
          subject?: string | null
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          receiver_id?: string | null
          receiver_name?: string | null
          sender_id?: string
          sender_name?: string | null
          sender_type?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
      notification_sends: {
        Row: {
          action_url: string | null
          category: string
          channel: string | null
          created_at: string
          delivered_count: number
          description: string
          id: string
          metadata: Json | null
          priority: string
          read_count: number
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string
          status: string
          target_count: number
          target_type: string
          target_user_id: string | null
          template_id: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          channel?: string | null
          created_at?: string
          delivered_count?: number
          description: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_count?: number
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by: string
          status?: string
          target_count?: number
          target_type: string
          target_user_id?: string | null
          template_id?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          category?: string
          channel?: string | null
          created_at?: string
          delivered_count?: number
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_count?: number
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string
          status?: string
          target_count?: number
          target_type?: string
          target_user_id?: string | null
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_sends_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sends_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean
          title?: string
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
      offboarding_checklists: {
        Row: {
          company_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          id: string
          is_completed: boolean
          item_label: string
          sort_order: number
          team_member_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_label: string
          sort_order?: number
          team_member_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          item_label?: string
          sort_order?: number
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_checklists_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_templates: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          item_label: string
          sort_order: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          item_label: string
          sort_order?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          item_label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_logs: {
        Row: {
          action: string
          details: string | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_at: string
          performed_by: string
          performed_by_name: string
          permission_code: string | null
          target_group_id: string | null
          target_role_id: string | null
          target_user_id: string | null
          target_user_name: string | null
        }
        Insert: {
          action: string
          details?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by: string
          performed_by_name: string
          permission_code?: string | null
          target_group_id?: string | null
          target_role_id?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Update: {
          action?: string
          details?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_at?: string
          performed_by?: string
          performed_by_name?: string
          permission_code?: string | null
          target_group_id?: string | null
          target_role_id?: string | null
          target_user_id?: string | null
          target_user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_audit_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          member_user_ids: string[] | null
          name: string
          permission_codes: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_user_ids?: string[] | null
          name: string
          permission_codes?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_user_ids?: string[] | null
          name?: string
          permission_codes?: string[] | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          category: string
          code: string
          description: string | null
          display_name: string
          id: string
          resource: string
        }
        Insert: {
          action: string
          category?: string
          code: string
          description?: string | null
          display_name: string
          id?: string
          resource: string
        }
        Update: {
          action?: string
          category?: string
          code?: string
          description?: string | null
          display_name?: string
          id?: string
          resource?: string
        }
        Relationships: []
      }
      plan_capabilities: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          name: string
          possible_values: string[] | null
          value_type: string
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          key: string
          name: string
          possible_values?: string[] | null
          value_type?: string
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          possible_values?: string[] | null
          value_type?: string
        }
        Relationships: []
      }
      plan_capability_assignments: {
        Row: {
          capability_key: string
          plan_id: string
          value: string
        }
        Insert: {
          capability_key: string
          plan_id: string
          value: string
        }
        Update: {
          capability_key?: string
          plan_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_capability_assignments_capability_key_fkey"
            columns: ["capability_key"]
            isOneToOne: false
            referencedRelation: "plan_capabilities"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "plan_capability_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          badge: string | null
          billing_model: string
          bonus_tests: Json | null
          created_at: string
          description: string | null
          description_short: string | null
          discount_min_period: string | null
          discount_percentage: number | null
          features: string[] | null
          id: string
          is_active: boolean
          is_free: boolean
          launch_price_end_date: string | null
          launch_prices: Json | null
          name: string
          prices: Json
          slug: string
          sort_order: number
          stripe_price_ids_live: Json | null
          stripe_price_ids_test: Json | null
          stripe_product_id_live: string | null
          stripe_product_id_test: string | null
          stripe_synced_at_live: string | null
          stripe_synced_at_test: string | null
          trial_duration_days: number | null
          type: string
        }
        Insert: {
          badge?: string | null
          billing_model?: string
          bonus_tests?: Json | null
          created_at?: string
          description?: string | null
          description_short?: string | null
          discount_min_period?: string | null
          discount_percentage?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          launch_price_end_date?: string | null
          launch_prices?: Json | null
          name: string
          prices?: Json
          slug: string
          sort_order?: number
          stripe_price_ids_live?: Json | null
          stripe_price_ids_test?: Json | null
          stripe_product_id_live?: string | null
          stripe_product_id_test?: string | null
          stripe_synced_at_live?: string | null
          stripe_synced_at_test?: string | null
          trial_duration_days?: number | null
          type: string
        }
        Update: {
          badge?: string | null
          billing_model?: string
          bonus_tests?: Json | null
          created_at?: string
          description?: string | null
          description_short?: string | null
          discount_min_period?: string | null
          discount_percentage?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          launch_price_end_date?: string | null
          launch_prices?: Json | null
          name?: string
          prices?: Json
          slug?: string
          sort_order?: number
          stripe_price_ids_live?: Json | null
          stripe_price_ids_test?: Json | null
          stripe_product_id_live?: string | null
          stripe_product_id_test?: string | null
          stripe_synced_at_live?: string | null
          stripe_synced_at_test?: string | null
          trial_duration_days?: number | null
          type?: string
        }
        Relationships: []
      }
      platform_metrics_daily: {
        Row: {
          active_jobs: number
          applications: number
          cancellations: number
          hires: number
          id: string
          interviews_done: number
          interviews_scheduled: number
          metric_date: string
          mrr: number
          new_candidates: number
          new_companies: number
          new_jobs: number
          new_subscriptions: number
          revenue: number
          tests_completed: number
          tests_started: number
          total_candidates: number
          total_companies: number
        }
        Insert: {
          active_jobs?: number
          applications?: number
          cancellations?: number
          hires?: number
          id?: string
          interviews_done?: number
          interviews_scheduled?: number
          metric_date: string
          mrr?: number
          new_candidates?: number
          new_companies?: number
          new_jobs?: number
          new_subscriptions?: number
          revenue?: number
          tests_completed?: number
          tests_started?: number
          total_candidates?: number
          total_companies?: number
        }
        Update: {
          active_jobs?: number
          applications?: number
          cancellations?: number
          hires?: number
          id?: string
          interviews_done?: number
          interviews_scheduled?: number
          metric_date?: string
          mrr?: number
          new_candidates?: number
          new_companies?: number
          new_jobs?: number
          new_subscriptions?: number
          revenue?: number
          tests_completed?: number
          tests_started?: number
          total_candidates?: number
          total_companies?: number
        }
        Relationships: []
      }
      positions: {
        Row: {
          department_id: string
          id: string
          is_active: boolean
          level: string | null
          title: string
        }
        Insert: {
          department_id: string
          id?: string
          is_active?: boolean
          level?: string | null
          title: string
        }
        Update: {
          department_id?: string
          id?: string
          is_active?: boolean
          level?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_summaries: {
        Row: {
          description: string | null
          id: string
          label: string
        }
        Insert: {
          description?: string | null
          id: string
          label: string
        }
        Update: {
          description?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          group_ids: string[] | null
          id: string
          last_access_at: string | null
          name: string
          phone: string | null
          role_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          group_ids?: string[] | null
          id: string
          last_access_at?: string | null
          name: string
          phone?: string | null
          role_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          group_ids?: string[] | null
          id?: string
          last_access_at?: string | null
          name?: string
          phone?: string | null
          role_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      report_schedules: {
        Row: {
          created_at: string
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          hour: number
          id: string
          is_active: boolean
          last_sent_at: string | null
          name: string
          next_send_at: string | null
          recipients: string[] | null
          type: string
        }
        Insert: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          hour?: number
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          next_send_at?: string | null
          recipients?: string[] | null
          type?: string
        }
        Update: {
          created_at?: string
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          hour?: number
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          next_send_at?: string | null
          recipients?: string[] | null
          type?: string
        }
        Relationships: []
      }
      retest_schedules: {
        Row: {
          auto_send: boolean
          created_at: string
          frequency: string
          id: string
          last_sent_at: string | null
          member_id: string
          next_date: string
        }
        Insert: {
          auto_send?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          member_id: string
          next_date: string
        }
        Update: {
          auto_send?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_sent_at?: string | null
          member_id?: string
          next_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "retest_schedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          level: number
          name: string
          permissions: string[] | null
          slug: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          level?: number
          name: string
          permissions?: string[] | null
          slug: string
          type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          level?: number
          name?: string
          permissions?: string[] | null
          slug?: string
          type?: string
        }
        Relationships: []
      }
      settings_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          key: string
          name: string
          options: Json | null
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          name: string
          options?: Json | null
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          name?: string
          options?: Json | null
          sort_order?: number
        }
        Relationships: []
      }
      settings_history: {
        Row: {
          category_key: string
          changed_by: string | null
          changed_by_name: string | null
          created_at: string
          entity_id: string | null
          field_key: string
          field_name: string
          id: string
          new_value: Json | null
          panel: string
          previous_value: Json | null
          subcategory_key: string
        }
        Insert: {
          category_key: string
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          entity_id?: string | null
          field_key: string
          field_name: string
          id?: string
          new_value?: Json | null
          panel: string
          previous_value?: Json | null
          subcategory_key: string
        }
        Update: {
          category_key?: string
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
          entity_id?: string | null
          field_key?: string
          field_name?: string
          id?: string
          new_value?: Json | null
          panel?: string
          previous_value?: Json | null
          subcategory_key?: string
        }
        Relationships: []
      }
      standardized_skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          type: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          type: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          type?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          environment: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          environment: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          action: string
          created_at: string
          from_plan_id: string | null
          id: string
          notes: string | null
          performed_by: string | null
          subscription_id: string
          to_plan_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          from_plan_id?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          subscription_id: string
          to_plan_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          from_plan_id?: string | null
          id?: string
          notes?: string | null
          performed_by?: string | null
          subscription_id?: string
          to_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          bonus_tests_remaining: number | null
          bonus_tests_total: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          end_date: string | null
          id: string
          is_early_adopter: boolean
          is_trial: boolean | null
          payment_method: string | null
          period: string
          plan_id: string
          plan_name: string | null
          plan_slug: string | null
          price_paid: number
          renewal_date: string | null
          scheduled_plan_change: Json | null
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end_date: string | null
          trial_released_at: string | null
          trial_start_date: string | null
          user_id: string
          user_name: string | null
          user_type: string | null
        }
        Insert: {
          bonus_tests_remaining?: number | null
          bonus_tests_total?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_early_adopter?: boolean
          is_trial?: boolean | null
          payment_method?: string | null
          period?: string
          plan_id: string
          plan_name?: string | null
          plan_slug?: string | null
          price_paid?: number
          renewal_date?: string | null
          scheduled_plan_change?: Json | null
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_released_at?: string | null
          trial_start_date?: string | null
          user_id: string
          user_name?: string | null
          user_type?: string | null
        }
        Update: {
          bonus_tests_remaining?: number | null
          bonus_tests_total?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_early_adopter?: boolean
          is_trial?: boolean | null
          payment_method?: string | null
          period?: string
          plan_id?: string
          plan_name?: string | null
          plan_slug?: string | null
          price_paid?: number
          renewal_date?: string | null
          scheduled_plan_change?: Json | null
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_released_at?: string | null
          trial_start_date?: string | null
          user_id?: string
          user_name?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          entity_id: string | null
          id: string
          panel: string
          updated_at: string
          updated_by: string | null
          values: Json
        }
        Insert: {
          category: string
          created_at?: string
          entity_id?: string | null
          id?: string
          panel: string
          updated_at?: string
          updated_by?: string | null
          values?: Json
        }
        Update: {
          category?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          panel?: string
          updated_at?: string
          updated_by?: string | null
          values?: Json
        }
        Relationships: []
      }
      team_member_events: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          metadata: Json
          performed_by: string | null
          team_member_id: string
          visibility: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_type: string
          id?: string
          metadata?: Json
          performed_by?: string | null
          team_member_id: string
          visibility?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json
          performed_by?: string | null
          team_member_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_events_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_events_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          anonymized: boolean
          anonymized_at: string | null
          archetype: string | null
          avatar_url: string | null
          company_id: string
          cpf: string | null
          created_at: string
          department_id: string | null
          email: string
          gauge_scores: Json | null
          gauge_status: string
          hire_date: string | null
          id: string
          imported_from_candidate_id: string | null
          is_active: boolean
          last_test_date: string | null
          leave_expected_return: string | null
          leave_include_metrics: boolean
          leave_start_date: string | null
          leave_type: string | null
          name: string
          phone: string | null
          position_id: string | null
          previous_team_member_id: string | null
          status: string
          termination_date: string | null
          termination_notes: string | null
          termination_reason: string | null
          termination_reason_detail: string | null
          termination_scheduled_date: string | null
          updated_at: string
        }
        Insert: {
          anonymized?: boolean
          anonymized_at?: string | null
          archetype?: string | null
          avatar_url?: string | null
          company_id: string
          cpf?: string | null
          created_at?: string
          department_id?: string | null
          email: string
          gauge_scores?: Json | null
          gauge_status?: string
          hire_date?: string | null
          id?: string
          imported_from_candidate_id?: string | null
          is_active?: boolean
          last_test_date?: string | null
          leave_expected_return?: string | null
          leave_include_metrics?: boolean
          leave_start_date?: string | null
          leave_type?: string | null
          name: string
          phone?: string | null
          position_id?: string | null
          previous_team_member_id?: string | null
          status?: string
          termination_date?: string | null
          termination_notes?: string | null
          termination_reason?: string | null
          termination_reason_detail?: string | null
          termination_scheduled_date?: string | null
          updated_at?: string
        }
        Update: {
          anonymized?: boolean
          anonymized_at?: string | null
          archetype?: string | null
          avatar_url?: string | null
          company_id?: string
          cpf?: string | null
          created_at?: string
          department_id?: string | null
          email?: string
          gauge_scores?: Json | null
          gauge_status?: string
          hire_date?: string | null
          id?: string
          imported_from_candidate_id?: string | null
          is_active?: boolean
          last_test_date?: string | null
          leave_expected_return?: string | null
          leave_include_metrics?: boolean
          leave_start_date?: string | null
          leave_type?: string | null
          name?: string
          phone?: string | null
          position_id?: string | null
          previous_team_member_id?: string | null
          status?: string
          termination_date?: string | null
          termination_notes?: string | null
          termination_reason?: string | null
          termination_reason_detail?: string | null
          termination_scheduled_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_imported_from_candidate_id_fkey"
            columns: ["imported_from_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_previous_team_member_id_fkey"
            columns: ["previous_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      test_audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          details: string | null
          id: string
          resource_id: string
          resource_name: string | null
          resource_type: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          details?: string | null
          id?: string
          resource_id: string
          resource_name?: string | null
          resource_type: string
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          details?: string | null
          id?: string
          resource_id?: string
          resource_name?: string | null
          resource_type?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_credit_transactions: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          created_by: string | null
          credit_id: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          created_by?: string | null
          credit_id: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          credit_id?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_credit_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_credit_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_credit_transactions_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "test_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      test_credits: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          origin: string
          package_id: string | null
          purchased_at: string | null
          remaining_credits: number | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_credits: number
          used_credits: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          origin?: string
          package_id?: string | null
          purchased_at?: string | null
          remaining_credits?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_credits: number
          used_credits?: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          origin?: string
          package_id?: string | null
          purchased_at?: string | null
          remaining_credits?: number | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_credits?: number
          used_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_credits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_credits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "test_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      test_invitations: {
        Row: {
          assessment_id: string | null
          candidate_email: string
          candidate_id: string | null
          candidate_name: string
          completed_at: string | null
          created_at: string
          delivery_channel: string | null
          department_id: string | null
          expires_at: string
          id: string
          invite_origin: string | null
          method: string
          sent_at: string
          sent_by: string | null
          started_at: string | null
          status: string
          team_member_id: string | null
          test_id: string
          token: string | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          candidate_email: string
          candidate_id?: string | null
          candidate_name: string
          completed_at?: string | null
          created_at?: string
          delivery_channel?: string | null
          department_id?: string | null
          expires_at: string
          id?: string
          invite_origin?: string | null
          method: string
          sent_at?: string
          sent_by?: string | null
          started_at?: string | null
          status?: string
          team_member_id?: string | null
          test_id: string
          token?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          candidate_email?: string
          candidate_id?: string | null
          candidate_name?: string
          completed_at?: string | null
          created_at?: string
          delivery_channel?: string | null
          department_id?: string | null
          expires_at?: string
          id?: string
          invite_origin?: string | null
          method?: string
          sent_at?: string
          sent_by?: string | null
          started_at?: string | null
          status?: string
          team_member_id?: string | null
          test_id?: string
          token?: string | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_test_invitations_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_test_invitations_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["assessment_uuid"]
          },
          {
            foreignKeyName: "test_invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["assessment_uuid"]
          },
          {
            foreignKeyName: "test_invitations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "company_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_packages: {
        Row: {
          badge: string | null
          created_at: string | null
          credits: number
          description: string | null
          description_short: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          original_price: number | null
          payment_methods: string[]
          price: number
          slug: string
          sort_order: number | null
          stripe_price_id_live: string | null
          stripe_price_id_test: string | null
          stripe_product_id_live: string | null
          stripe_product_id_test: string | null
          stripe_synced_at_live: string | null
          stripe_synced_at_test: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          created_at?: string | null
          credits: number
          description?: string | null
          description_short?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          original_price?: number | null
          payment_methods?: string[]
          price: number
          slug: string
          sort_order?: number | null
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          stripe_product_id_live?: string | null
          stripe_product_id_test?: string | null
          stripe_synced_at_live?: string | null
          stripe_synced_at_test?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          created_at?: string | null
          credits?: number
          description?: string | null
          description_short?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          original_price?: number | null
          payment_methods?: string[]
          price?: number
          slug?: string
          sort_order?: number | null
          stripe_price_id_live?: string | null
          stripe_price_id_test?: string | null
          stripe_product_id_live?: string | null
          stripe_product_id_test?: string | null
          stripe_synced_at_live?: string | null
          stripe_synced_at_test?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          ai_analysis: string | null
          archetype_id: string | null
          candidate_email: string
          candidate_id: string | null
          candidate_name: string
          completed_at: string | null
          created_at: string
          development_areas: string[] | null
          fit_classification: string | null
          fit_score: number | null
          id: string
          invitation_id: string | null
          primary_dimension: string | null
          scores: Json
          secondary_dimension: string | null
          shortlist_notes: string | null
          shortlisted: boolean | null
          strengths: string[] | null
          test_id: string
        }
        Insert: {
          ai_analysis?: string | null
          archetype_id?: string | null
          candidate_email: string
          candidate_id?: string | null
          candidate_name: string
          completed_at?: string | null
          created_at?: string
          development_areas?: string[] | null
          fit_classification?: string | null
          fit_score?: number | null
          id?: string
          invitation_id?: string | null
          primary_dimension?: string | null
          scores?: Json
          secondary_dimension?: string | null
          shortlist_notes?: string | null
          shortlisted?: boolean | null
          strengths?: string[] | null
          test_id: string
        }
        Update: {
          ai_analysis?: string | null
          archetype_id?: string | null
          candidate_email?: string
          candidate_id?: string | null
          candidate_name?: string
          completed_at?: string | null
          created_at?: string
          development_areas?: string[] | null
          fit_classification?: string | null
          fit_score?: number | null
          id?: string
          invitation_id?: string | null
          primary_dimension?: string | null
          scores?: Json
          secondary_dimension?: string | null
          shortlist_notes?: string | null
          shortlisted?: boolean | null
          strengths?: string[] | null
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "test_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["invitation_id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "company_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_by: string
          performed_by_name: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by: string
          performed_by_name?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string
          performed_by_name?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_audit_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_csat: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_csat_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_csat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_internal_note: boolean
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          sender_id: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          ai_suggested_category: string | null
          ai_suggested_priority: string | null
          ai_summary: string | null
          ai_triage_status: string | null
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          number: number
          priority: string
          requester_type: string | null
          resolved_at: string | null
          sla_deadline: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggested_category?: string | null
          ai_suggested_priority?: string | null
          ai_summary?: string | null
          ai_triage_status?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          number?: number
          priority?: string
          requester_type?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggested_category?: string | null
          ai_suggested_priority?: string | null
          ai_summary?: string | null
          ai_triage_status?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          number?: number
          priority?: string
          requester_type?: string | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          badges: Json | null
          created_at: string
          id: string
          stats: Json | null
          streak_current: number
          streak_last_login: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: Json | null
          created_at?: string
          id?: string
          stats?: Json | null
          streak_current?: number
          streak_last_login?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: Json | null
          created_at?: string
          id?: string
          stats?: Json | null
          streak_current?: number
          streak_last_login?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permission_overrides: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission_code: string
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission_code: string
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission_code?: string
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permission_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message_text: string
          notification_send_id: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_phone: string
          recipient_type: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          template_id: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_text: string
          notification_send_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone: string
          recipient_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          template_id?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_text?: string
          notification_send_id?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_phone?: string
          recipient_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          template_id?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_notification_send_id_fkey"
            columns: ["notification_send_id"]
            isOneToOne: false
            referencedRelation: "notification_sends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          message_text: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_text: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_text?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_test_tracking_chain: {
        Row: {
          ai_analysis_id: string | null
          ai_analysis_status: string | null
          archetype_id: string | null
          assessment_id: string | null
          assessment_phase: string | null
          assessment_uuid: string | null
          candidate_id: string | null
          candidate_name: string | null
          company_id: string | null
          completed_at: string | null
          final_scores: Json | null
          invitation_id: string | null
          invitation_status: string | null
          primary_dimension: string | null
          result_id: string | null
          secondary_dimension: string | null
          sent_at: string | null
          started_at: string | null
          team_member_id: string | null
          test_id: string | null
          test_name: string | null
          viewed_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_tests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_test_invitations_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_test_invitations_assessment"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["assessment_uuid"]
          },
          {
            foreignKeyName: "gauge_pro_results_archetype_id_fkey"
            columns: ["archetype_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_archetypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "gauge_pro_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vw_test_tracking_chain"
            referencedColumns: ["assessment_uuid"]
          },
          {
            foreignKeyName: "test_invitations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_invitations_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "company_tests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_manual_credit: {
        Args: {
          p_amount: number
          p_company_id: string
          p_created_by: string
          p_description: string
        }
        Returns: string
      }
      admin_manual_debit: {
        Args: {
          p_amount: number
          p_company_id: string
          p_created_by: string
          p_description: string
        }
        Returns: number
      }
      admin_transfer_credits: {
        Args: {
          p_amount: number
          p_created_by: string
          p_description: string
          p_source_company_id: string
          p_target_company_id: string
        }
        Returns: string
      }
      calculate_candidate_experience_years: {
        Args: { p_candidate_id: string }
        Returns: number
      }
      calculate_sla_deadline: {
        Args: { p_created_at: string; p_priority: string }
        Returns: string
      }
      check_cnpj_available: { Args: { p_cnpj: string }; Returns: boolean }
      check_cpf_exists: { Args: { p_cpf: string }; Returns: boolean }
      close_job_with_remaining: {
        Args: { p_action: string; p_job_id: string; p_notify?: boolean }
        Returns: Json
      }
      consume_ai_match_credit: {
        Args: { p_candidate_id: string; p_job_id: string }
        Returns: string
      }
      consume_test_credit: {
        Args: {
          p_company_id: string
          p_created_by: string
          p_description: string
          p_invitation_id: string
        }
        Returns: string
      }
      count_candidate_external_applications: {
        Args: { p_candidate_id: string }
        Returns: number
      }
      detect_abandoned_invitations: {
        Args: { p_company_id: string }
        Returns: number
      }
      expire_stale_invitations: { Args: never; Returns: number }
      get_ai_match_quota_status: {
        Args: never
        Returns: {
          remaining: number
          total: number
          unlimited: boolean
          used: number
        }[]
      }
      get_candidate_id: { Args: { p_user_id: string }; Returns: string }
      get_chatbot_config: { Args: never; Returns: Json }
      get_company_credit_balance: {
        Args: { p_company_id: string }
        Returns: number
      }
      get_company_id: { Args: { p_user_id: string }; Returns: string }
      get_gauge_pro_scenario_order_mode: { Args: never; Returns: string }
      get_gauge_pro_word_order_mode: { Args: never; Returns: string }
      get_llm_config: { Args: never; Returns: Json }
      get_or_create_conversation: {
        Args: {
          p_candidate_id: string
          p_company_id: string
          p_job_id?: string
        }
        Returns: Json
      }
      get_pending_gauge_pro_candidates: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          onboarding_step: string
          phone: string
          profile_id: string
        }[]
      }
      get_test_metrics: {
        Args: { p_company_id: string; p_from?: string; p_to?: string }
        Returns: Json
      }
      get_user_type: { Args: { user_id: string }; Returns: string }
      hire_candidate: {
        Args: {
          p_application_id: string
          p_department_id: string
          p_hire_date: string
          p_notes?: string
          p_position_title: string
          p_salary?: number
        }
        Returns: Json
      }
      is_notification_enabled: {
        Args: { p_trigger_key: string }
        Returns: boolean
      }
      log_rbac_audit: {
        Args: {
          p_action: string
          p_details?: string
          p_new_value?: string
          p_old_value?: string
          p_permission_code?: string
          p_target_group_id?: string
          p_target_role_id?: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      notify_admins: {
        Args: {
          p_action_url: string
          p_description: string
          p_metadata?: Json
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      notify_candidate: {
        Args: {
          p_action_url: string
          p_candidate_id: string
          p_description: string
          p_metadata?: Json
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      notify_company_users: {
        Args: {
          p_action_url: string
          p_company_id: string
          p_description: string
          p_metadata?: Json
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      parse_legacy_location: {
        Args: { loc: string }
        Returns: {
          parsed_city: string
          parsed_state: string
        }[]
      }
      populate_daily_metrics: {
        Args: { target_date: string }
        Returns: undefined
      }
      process_scheduled_retests: { Args: never; Returns: number }
      refund_ai_match_credit: { Args: { p_usage_id: string }; Returns: boolean }
      refund_test_credit: {
        Args: {
          p_company_id: string
          p_description: string
          p_invitation_id: string
        }
        Returns: boolean
      }
      replace_curriculum_children: {
        Args: {
          p_curriculum_id: string
          p_experiences?: Json
          p_education?: Json
          p_skills?: Json
          p_courses?: Json
        }
        Returns: undefined
      }
      save_ai_analysis: {
        Args: {
          p_analysis_type?: string
          p_candidate_id?: string
          p_content?: string
          p_error_message?: string
          p_generation_time_ms?: number
          p_model_used?: string
          p_status?: string
          p_team_member_id?: string
          p_test_result_id?: string
          p_tokens_input?: number
          p_tokens_output?: number
        }
        Returns: string
      }
      save_ai_match_analysis: {
        Args: {
          p_algo_score: number
          p_content: string
          p_gen_ms: number
          p_model: string
          p_tokens_in: number
          p_tokens_out: number
          p_usage_id: string
        }
        Returns: string
      }
      send_manual_notification: {
        Args: {
          p_action_url?: string
          p_category?: string
          p_description: string
          p_priority?: string
          p_scheduled_at?: string
          p_target_type?: string
          p_target_user_id?: string
          p_template_id?: string
          p_title: string
        }
        Returns: Json
      }
      to_title_case: { Args: { input: string }; Returns: string }
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
