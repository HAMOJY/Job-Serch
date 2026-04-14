import { render, screen } from '@testing-library/react'
import AnalysisResult from '@/components/cv/AnalysisResult'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

const MOCK_ANALYSIS: CvAnalysisRow = {
  id: 'a1',
  user_id: 'u1',
  filename: 'resume.pdf',
  file_path: 'u1/a1.pdf',
  score: 87,
  categories: {
    technical_skills: 91,
    work_experience: 85,
    education: 78,
    clarity: 94,
  },
  recommendations: [
    'أضف مشاريع GitHub لتعزيز ملفك التقني',
    'اذكر الإنجازات بأرقام',
    'أضف شهادة احترافية',
  ],
  status: 'done',
  error_msg: null,
  created_at: '2025-04-14T10:00:00Z',
}

describe('AnalysisResult', () => {
  it('displays the overall score', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('displays all four category labels', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('المهارات التقنية')).toBeInTheDocument()
    expect(screen.getByText('الخبرة المهنية')).toBeInTheDocument()
    expect(screen.getByText('التعليم والشهادات')).toBeInTheDocument()
    expect(screen.getByText('وضوح وتنظيم الـ CV')).toBeInTheDocument()
  })

  it('displays all four category scores as percentages', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('91%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('78%')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
  })

  it('displays all recommendations', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText(/أضف مشاريع GitHub/)).toBeInTheDocument()
    expect(screen.getByText(/اذكر الإنجازات بأرقام/)).toBeInTheDocument()
    expect(screen.getByText(/أضف شهادة احترافية/)).toBeInTheDocument()
  })

  it('shows the filename', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
  })
})
