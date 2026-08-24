export type MessageRole = "user" | "assistant"

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          parts: unknown
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: MessageRole
          parts: unknown
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: MessageRole
          parts?: unknown
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_limit: number
          p_window_minutes: number
        }
        Returns: boolean
      }
    }
  }
}
