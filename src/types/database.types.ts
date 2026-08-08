export type ApplicationStatusValue =
  | "interested"
  | "applied"
  | "interview_scheduled"
  | "interview_completed"
  | "awaiting_response"
  | "offer_received"
  | "rejected"
  | "withdrawn";

export type WorkModeValue = "onsite" | "hybrid" | "remote";
export type ActionStatusValue = "pending" | "completed" | "cancelled";
export type ActionPriorityValue = "low" | "medium" | "high";

export type ProfileRow = {
  id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  id: string;
  full_name: string;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<ProfileInsert>;

export type CompanyRow = {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  work_mode: WorkModeValue | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyInsert = {
  id?: string;
  user_id: string;
  name: string;
  website?: string | null;
  location?: string | null;
  industry?: string | null;
  work_mode?: WorkModeValue | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CompanyUpdate = Partial<CompanyInsert>;

export type RecruiterRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RecruiterInsert = {
  id?: string;
  user_id: string;
  company_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  linkedin_url?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RecruiterUpdate = Partial<RecruiterInsert>;

export type OpportunityRow = {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  location: string | null;
  work_mode: WorkModeValue | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  job_url: string | null;
  skills: string[];
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type OpportunityInsert = {
  id?: string;
  user_id: string;
  company_id: string;
  title: string;
  location?: string | null;
  work_mode?: WorkModeValue | null;
  employment_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  job_url?: string | null;
  skills?: string[];
  summary?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OpportunityUpdate = Partial<OpportunityInsert>;

export type ApplicationRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  primary_recruiter_id: string | null;
  status: ApplicationStatusValue;
  application_date: string;
  source: string | null;
  expected_salary: number | null;
  summary_notes: string | null;
  next_action_summary: string | null;
  follow_up_date: string | null;
  interview_preparation: string | null;
  questions_for_company: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationInsert = {
  id?: string;
  user_id: string;
  opportunity_id: string;
  primary_recruiter_id?: string | null;
  status?: ApplicationStatusValue;
  application_date?: string;
  source?: string | null;
  expected_salary?: number | null;
  summary_notes?: string | null;
  next_action_summary?: string | null;
  follow_up_date?: string | null;
  interview_preparation?: string | null;
  questions_for_company?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ApplicationUpdate = Partial<ApplicationInsert>;

export type InterviewRow = {
  id: string;
  user_id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  location_or_url: string | null;
  participants: string[];
  preparation: string | null;
  feedback: string | null;
  result: string | null;
  created_at: string;
  updated_at: string;
};

export type InterviewInsert = {
  id?: string;
  user_id: string;
  application_id: string;
  interview_type: string;
  scheduled_at: string;
  location_or_url?: string | null;
  participants?: string[];
  preparation?: string | null;
  feedback?: string | null;
  result?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InterviewUpdate = Partial<InterviewInsert>;

export type NoteRow = {
  id: string;
  user_id: string;
  application_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type NoteInsert = {
  id?: string;
  user_id: string;
  application_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export type NoteUpdate = Partial<NoteInsert>;

export type ActionRow = {
  id: string;
  user_id: string;
  application_id: string;
  description: string;
  due_date: string | null;
  status: ActionStatusValue;
  priority: ActionPriorityValue;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ActionInsert = {
  id?: string;
  user_id: string;
  application_id: string;
  description: string;
  due_date?: string | null;
  status?: ActionStatusValue;
  priority?: ActionPriorityValue;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ActionUpdate = Partial<ActionInsert>;

interface Relationship {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}

interface TableDefinition<
  Row,
  Insert,
  Update,
  Relationships extends Relationship[] = [],
> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
}

export type ApplicationTransactionArgs = {
  p_company_id: string;
  p_title: string;
  p_location: string | null;
  p_work_mode: WorkModeValue | null;
  p_employment_type: string | null;
  p_salary_min: number | null;
  p_salary_max: number | null;
  p_currency: string;
  p_job_url: string | null;
  p_skills: string[];
  p_opportunity_summary: string | null;
  p_status: ApplicationStatusValue;
  p_application_date: string;
  p_source: string | null;
  p_expected_salary: number | null;
  p_summary_notes: string | null;
  p_next_action_summary: string | null;
  p_follow_up_date: string | null;
  p_interview_preparation: string | null;
  p_questions_for_company: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDefinition<ProfileRow, ProfileInsert, ProfileUpdate>;
      companies: TableDefinition<CompanyRow, CompanyInsert, CompanyUpdate>;
      recruiters: TableDefinition<
        RecruiterRow,
        RecruiterInsert,
        RecruiterUpdate,
        [
          {
            foreignKeyName: "recruiters_company_same_user";
            columns: ["user_id", "company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
      opportunities: TableDefinition<
        OpportunityRow,
        OpportunityInsert,
        OpportunityUpdate,
        [
          {
            foreignKeyName: "opportunities_company_same_user";
            columns: ["user_id", "company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
      applications: TableDefinition<
        ApplicationRow,
        ApplicationInsert,
        ApplicationUpdate,
        [
          {
            foreignKeyName: "applications_opportunity_same_user";
            columns: ["user_id", "opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["user_id", "id"];
          },
          {
            foreignKeyName: "applications_recruiter_same_user";
            columns: ["user_id", "primary_recruiter_id"];
            isOneToOne: false;
            referencedRelation: "recruiters";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
      interviews: TableDefinition<
        InterviewRow,
        InterviewInsert,
        InterviewUpdate,
        [
          {
            foreignKeyName: "interviews_application_same_user";
            columns: ["user_id", "application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
      notes: TableDefinition<
        NoteRow,
        NoteInsert,
        NoteUpdate,
        [
          {
            foreignKeyName: "notes_application_same_user";
            columns: ["user_id", "application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
      actions: TableDefinition<
        ActionRow,
        ActionInsert,
        ActionUpdate,
        [
          {
            foreignKeyName: "actions_application_same_user";
            columns: ["user_id", "application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["user_id", "id"];
          },
        ]
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_application_with_opportunity: {
        Args: ApplicationTransactionArgs;
        Returns: string;
      };
      update_application_with_opportunity: {
        Args: ApplicationTransactionArgs & { p_application_id: string };
        Returns: boolean;
      };
      delete_application_with_opportunity: {
        Args: { p_application_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      application_status: ApplicationStatusValue;
      work_mode: WorkModeValue;
      action_status: ActionStatusValue;
      action_priority: ActionPriorityValue;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type PublicTableName = keyof Database["public"]["Tables"];
export type TableRow<Name extends PublicTableName> =
  Database["public"]["Tables"][Name]["Row"];
export type TableInsert<Name extends PublicTableName> =
  Database["public"]["Tables"][Name]["Insert"];
export type TableUpdate<Name extends PublicTableName> =
  Database["public"]["Tables"][Name]["Update"];
