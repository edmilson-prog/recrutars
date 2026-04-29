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
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          content?: string
          created_at?: string
          id?: string
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
      candidates: {
        Row: {
          about: string | null
          anonymous_id: string | null
          availability: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          deactivated_at: string | null
          display_name: string | null
          education: string | null
          email: string
          experience_years: number | null
          has_test: boolean | null
          id: string
          linkedin: string | null
          location: string | null
          name: string
          open_to_relocation: boolean | null
          phone: string | null
          plan: string | null
          profile_completion: number | null
          profile_id: string
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          visibility_mode: string | null
        }
        Insert: {
          about?: string | null
          anonymous_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deactivated_at?: string | null
          display_name?: string | null
          education?: string | null
          email: string
          experience_years?: number | null
          has_test?: boolean | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name: string
          open_to_relocation?: boolean | null
          phone?: string | null
          plan?: string | null
          profile_completion?: number | null
          profile_id: string
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          visibility_mode?: string | null
        }
        Update: {
          about?: string | null
          anonymous_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deactivated_at?: string | null
          display_name?: string | null
          education?: string | null
          email?: string
          experience_years?: number | null
          has_test?: boolean | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name?: string
          open_to_relocation?: boolean | null
          phone?: string | null
          plan?: string | null
          profile_completion?: number | null
          profile_id?: string
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          visibility_mode?: string | null
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
          city: string | null
          cep: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string | null
          deactivated_at: string | null
          description: string | null
          id: string
          industry: string | null
          linkedin: string | null
          location: string | null
          logradouro: string | null
          logo_url: string | null
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
          logradouro?: string | null
          logo_url?: string | null
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
          logradouro?: string | null
          logo_url?: string | null
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
      conversations: {
        Row: {
          candidate_id: string
          company_id: string
          created_at: string
          id: string
          job_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
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
          created_at: string
          email: string | null
          id: string
          is_archived: boolean
          is_default: boolean
          linkedin: string | null
          location: string | null
          name: string
          phone: string | null
          salary_max: number | null
          salary_min: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          availability?: string | null
          candidate_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          linkedin?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          availability?: string | null
          candidate_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_default?: boolean
          linkedin?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculums_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
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
          description: string | null
          development_areas: string[] | null
          id: string
          ideal_roles: string[] | null
          name: string
          strengths: string[] | null
          work_style: string | null
        }
        Insert: {
          communication_style?: string | null
          description?: string | null
          development_areas?: string[] | null
          id: string
          ideal_roles?: string[] | null
          name: string
          strengths?: string[] | null
          work_style?: string | null
        }
        Update: {
          communication_style?: string | null
          description?: string | null
          development_areas?: string[] | null
          id?: string
          ideal_roles?: string[] | null
          name?: string
          strengths?: string[] | null
          work_style?: string | null
        }
        Relationships: []
      }
      gauge_pro_assessments: {
        Row: {
          candidate_id: string
          completed_at: string | null
          current_scenario_index: number
          current_word_step: number
          id: string
          phase: string
          scenario_responses: Json | null
          started_at: string
          word_step_responses: Json | null
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          current_scenario_index?: number
          current_word_step?: number
          id?: string
          phase?: string
          scenario_responses?: Json | null
          started_at?: string
          word_step_responses?: Json | null
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          current_scenario_index?: number
          current_word_step?: number
          id?: string
          phase?: string
          scenario_responses?: Json | null
          started_at?: string
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
        ]
      }
      gauge_pro_results: {
        Row: {
          archetype_id: string | null
          assessment_id: string
          badge_awarded: string | null
          candidate_id: string
          career_recommendations: string[] | null
          classifications: Json | null
          development_areas: string[] | null
          final_scores: Json | null
          generated_at: string
          id: string
          part1_scores: Json | null
          part2_scores: Json | null
          primary_dimension: string | null
          secondary_dimension: string | null
          strengths: string[] | null
          xp_awarded: number
        }
        Insert: {
          archetype_id?: string | null
          assessment_id: string
          badge_awarded?: string | null
          candidate_id: string
          career_recommendations?: string[] | null
          classifications?: Json | null
          development_areas?: string[] | null
          final_scores?: Json | null
          generated_at?: string
          id?: string
          part1_scores?: Json | null
          part2_scores?: Json | null
          primary_dimension?: string | null
          secondary_dimension?: string | null
          strengths?: string[] | null
          xp_awarded?: number
        }
        Update: {
          archetype_id?: string | null
          assessment_id?: string
          badge_awarded?: string | null
          candidate_id?: string
          career_recommendations?: string[] | null
          classifications?: Json | null
          development_areas?: string[] | null
          final_scores?: Json | null
          generated_at?: string
          id?: string
          part1_scores?: Json | null
          part2_scores?: Json | null
          primary_dimension?: string | null
          secondary_dimension?: string | null
          strengths?: string[] | null
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
            foreignKeyName: "gauge_pro_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      gauge_pro_scenarios: {
        Row: {
          id: number
          options: Json
          situation: string
          sort_order: number
          title: string
        }
        Insert: {
          id?: number
          options?: Json
          situation: string
          sort_order?: number
          title: string
        }
        Update: {
          id?: number
          options?: Json
          situation?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      gauge_pro_words: {
        Row: {
          dimension: string
          id: number
          polarity: string
          text: string
        }
        Insert: {
          dimension: string
          id?: number
          polarity: string
          text: string
        }
        Update: {
          dimension?: string
          id?: number
          polarity?: string
          text?: string
        }
        Relationships: []
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
          completed_at: string | null
          confirmed_at: string | null
          confirmed_datetime: string | null
          created_at: string
          duration: number
          id: string
          interviewer_name: string | null
          interviewer_role: string | null
          job_id: string
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
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_datetime?: string | null
          created_at?: string
          duration?: number
          id?: string
          interviewer_name?: string | null
          interviewer_role?: string | null
          job_id: string
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
          completed_at?: string | null
          confirmed_at?: string | null
          confirmed_datetime?: string | null
          created_at?: string
          duration?: number
          id?: string
          interviewer_name?: string | null
          interviewer_role?: string | null
          job_id?: string
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
          sender_id: string
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
          sender_id: string
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
          sender_id?: string
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
          created_at: string
          description: string | null
          description_short: string | null
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
          type: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          description_short?: string | null
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
          type: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          description_short?: string | null
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
          id: string
          panel: string
          category_key: string
          subcategory_key: string
          field_key: string
          field_name: string
          previous_value: Json | null
          new_value: Json | null
          entity_id: string | null
          changed_by: string | null
          changed_by_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          panel: string
          category_key: string
          subcategory_key: string
          field_key: string
          field_name: string
          previous_value?: Json | null
          new_value?: Json | null
          entity_id?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          panel?: string
          category_key?: string
          subcategory_key?: string
          field_key?: string
          field_name?: string
          previous_value?: Json | null
          new_value?: Json | null
          entity_id?: string | null
          changed_by?: string | null
          changed_by_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          panel: string
          category: string
          entity_id: string | null
          values: Json
          updated_by: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          panel: string
          category: string
          entity_id?: string | null
          values?: Json
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          panel?: string
          category?: string
          entity_id?: string | null
          values?: Json
          updated_by?: string | null
          updated_at?: string
          created_at?: string
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
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          end_date: string | null
          id: string
          is_early_adopter: boolean
          period: string
          plan_id: string
          price_paid: number
          renewal_date: string | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_early_adopter?: boolean
          period?: string
          plan_id: string
          price_paid?: number
          renewal_date?: string | null
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_early_adopter?: boolean
          period?: string
          plan_id?: string
          price_paid?: number
          renewal_date?: string | null
          start_date?: string
          status?: string
          user_id?: string
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
      team_members: {
        Row: {
          archetype: string | null
          avatar_url: string | null
          company_id: string
          created_at: string
          department_id: string
          email: string
          gauge_scores: Json | null
          gauge_status: string
          hire_date: string | null
          id: string
          imported_from_candidate_id: string | null
          is_active: boolean
          last_test_date: string | null
          name: string
          position_id: string | null
          updated_at: string
        }
        Insert: {
          archetype?: string | null
          avatar_url?: string | null
          company_id: string
          created_at?: string
          department_id: string
          email: string
          gauge_scores?: Json | null
          gauge_status?: string
          hire_date?: string | null
          id?: string
          imported_from_candidate_id?: string | null
          is_active?: boolean
          last_test_date?: string | null
          name: string
          position_id?: string | null
          updated_at?: string
        }
        Update: {
          archetype?: string | null
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          department_id?: string
          email?: string
          gauge_scores?: Json | null
          gauge_status?: string
          hire_date?: string | null
          id?: string
          imported_from_candidate_id?: string | null
          is_active?: boolean
          last_test_date?: string | null
          name?: string
          position_id?: string | null
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
        ]
      }
      ticket_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
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
          category: string
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_candidate_id: { Args: { p_user_id: string }; Returns: string }
      get_company_id: { Args: { p_user_id: string }; Returns: string }
      get_user_type: { Args: { user_id: string }; Returns: string }
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
