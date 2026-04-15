import { render, screen, fireEvent } from '@testing-library/react'
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
    language_quality: 80,
    ats_compatibility: 75,
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
  it('displays the overall score in the circular meter', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('shows category score numbers in the overview tab by default', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    // overview shows first 4 categories — the number and % are in separate elements
    expect(screen.getByText('91')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('94')).toBeInTheDocument()
  })

  it('shows all six category labels in the details tab', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    fireEvent.click(screen.getByText('التفاصيل'))
    expect(screen.getByText('المهارات التقنية')).toBeInTheDocument()
    expect(screen.getByText('الخبرة المهنية')).toBeInTheDocument()
    expect(screen.getByText('التعليم والشهادات')).toBeInTheDocument()
    expect(screen.getByText('وضوح وتنظيم الـ CV')).toBeInTheDocument()
    expect(screen.getByText('جودة اللغة والكتابة')).toBeInTheDocument()
    expect(screen.getByText('توافق مع أنظمة ATS')).toBeInTheDocument()
  })

  it('displays all recommendations in the tips tab', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    fireEvent.click(screen.getByText('التوصيات'))
    expect(screen.getByText(/أضف مشاريع GitHub/)).toBeInTheDocument()
    expect(screen.getByText(/اذكر الإنجازات بأرقام/)).toBeInTheDocument()
    expect(screen.getByText(/أضف شهادة احترافية/)).toBeInTheDocument()
  })

  it('shows the filename', () => {
    render(<AnalysisResult analysis={MOCK_ANALYSIS} />)
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
  })
})
