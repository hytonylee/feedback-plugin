export interface AiSummary {
  summary: string
  suggestions: string[]
}

export interface Project {
  projectId: string
  projectName: string
  categories: string[]
  tags: string[]
  requirements: {
    tagsRequired: boolean
    commentRequired: boolean
  }
  spreadsheetId: string
  createdAt: string
  aiSummary?: AiSummary
  aiSummaryGeneratedAt?: string
}

export interface FeedbackRow {
  timestamp: string
  category: string
  tags: string[]
  comment: string
  sessionId: string
}

export interface PriorityItem {
  category: string
  score: number
  count: number
  topTags: string[]
  recentCount: number
}
