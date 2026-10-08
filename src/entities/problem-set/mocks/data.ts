import type { ProblemSetResponse } from '@/entities/problem-set/model/types'

export const problemSetMockResponse: ProblemSetResponse = {
  id: 'demo-problem-set',
  title: '한빛고 2학년 · 공공재와 시장 실패',
  description: '자료를 탐색하고 AI가 생성한 문항을 검토해 보세요.',
  questions: [
    {
      id: 'question-1',
      number: 1,
      stage: 'source',
      stageLabel: '자료 탐색',
      title: '자료에서 핵심 내용을 찾아보세요',
      prompt: '공공재의 특징으로 가장 적절한 설명을 선택하세요.',
      choices: [
        { id: 'choice-1-a', label: 'A', text: '한 사람이 소비하면 다른 사람은 소비할 수 없다.' },
        { id: 'choice-1-b', label: 'B', text: '대가를 지불하지 않은 사람의 소비를 막기 어렵다.' },
        { id: 'choice-1-c', label: 'C', text: '시장 가격이 항상 효율적인 자원 배분을 보장한다.' },
        { id: 'choice-1-d', label: 'D', text: '소비자가 늘어날수록 사회적 편익이 줄어든다.' },
      ],
    },
    {
      id: 'question-2',
      number: 2,
      stage: 'generation',
      stageLabel: 'AI 생성',
      title: '생성된 문항을 확인하세요',
      prompt: '다음 사례가 설명하는 시장 실패의 원인으로 가장 적절한 것은 무엇인가요?',
      choices: [
        { id: 'choice-2-a', label: 'A', text: '정보의 비대칭' },
        { id: 'choice-2-b', label: 'B', text: '공공재의 과소 공급' },
        { id: 'choice-2-c', label: 'C', text: '외부 효과의 발생' },
        { id: 'choice-2-d', label: 'D', text: '독점 경쟁의 심화' },
      ],
    },
    {
      id: 'question-3',
      number: 3,
      stage: 'review',
      stageLabel: '공통 검토',
      title: '수업에 사용할 문항을 검토하세요',
      prompt: '문항의 내용과 선택지가 학습 목표에 맞는지 확인한 뒤 답을 선택하세요.',
      choices: [
        { id: 'choice-3-a', label: 'A', text: '학습 목표와 문항의 요구가 일치한다.' },
        { id: 'choice-3-b', label: 'B', text: '선택지 간 난이도 차이가 지나치게 크다.' },
        { id: 'choice-3-c', label: 'C', text: '자료의 핵심 개념이 문항에 반영되지 않았다.' },
        { id: 'choice-3-d', label: 'D', text: '정답을 확인할 수 있는 단서가 부족하다.' },
      ],
    },
  ],
}
