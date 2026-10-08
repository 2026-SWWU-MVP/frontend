import { createMockRepository } from '@/shared/api/repositories'
import type { Repository } from '@/shared/api/types'
import { reportsMockData } from '@/entities/reports/mocks/data'
import type { ReportData, ReportFilters } from '@/entities/reports/model/types'

export const reportsRepository: Repository<ReportFilters, ReportData> = createMockRepository(async (filters) => {
  const subjectFactor = filters.subject === '전체 과목' ? 1 : filters.subject === '국어' ? 0.54 : filters.subject === '수학' ? 0.31 : 0.15
  const periodFactor = filters.period === reportsMockData.filters.periods[0] ? 1 : 0.8
  const schoolFactor = filters.school === '전체 학교' ? 1 : 0.7
  const factor = subjectFactor * periodFactor * schoolFactor
  const questions = Math.max(12, Math.round(156 * factor))
  return { ...reportsMockData, metrics: { ...reportsMockData.metrics, questions: `${questions}문항`, questionsDetail: filters.subject === '전체 과목' ? reportsMockData.metrics.questionsDetail : `${filters.subject} 중심 · 선택 필터 기준` }, trend: reportsMockData.trend.map((item) => ({ ...item, created: Math.max(1, Math.round(item.created * periodFactor * schoolFactor)), approved: Math.max(1, Math.round(item.approved * periodFactor * schoolFactor)) })), subjects: reportsMockData.subjects.map((item) => ({ ...item, questions: Math.max(1, Math.round(item.questions * factor)), percentage: filters.subject === '전체 과목' ? item.percentage : item.name === filters.subject ? 100 : 0 })), schools: reportsMockData.schools.map((item) => ({ ...item, sets: filters.school === '전체 학교' || filters.school === item.name ? item.sets : Math.max(1, Math.round(item.sets * 0.4)), questions: filters.school === '전체 학교' || filters.school === item.name ? item.questions : Math.max(4, Math.round(item.questions * 0.4)) })) }
})
