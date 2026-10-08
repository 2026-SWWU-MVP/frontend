export type SchoolTrendFilters = { query: string; school: string; subject: string; exam: string }
export type TrendItem = {
  id: string; school: string; gradeSubject: string; exam: string; size: string; updatedAt: string
  sourceCount: number; reviewComplete: boolean
  distribution: Array<{ label: string; percentage: number; count: number }>; insight: string
}
export type SchoolTrendsResponse = { items: TrendItem[]; totalSchools: number; totalSubjects: number; totalUploads: number }
