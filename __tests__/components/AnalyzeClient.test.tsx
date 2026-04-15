import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AnalyzeClient from '@/app/analyze/analyze-client'

jest.mock('@/components/cv/UploadZone', () => ({
  __esModule: true,
  default: ({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) => (
    <div>
      <span>{disabled ? 'upload-disabled' : 'upload-enabled'}</span>
      <button onClick={() => onFile(new File(['x'], 'cv.pdf', { type: 'application/pdf' }))}>
        upload-trigger
      </button>
    </div>
  ),
}))

jest.mock('@/components/cv/AnalysisResult', () => ({
  __esModule: true,
  default: ({ analysis }: { analysis: { score: number } }) => (
    <div data-testid="analysis-result">score: {analysis.score}</div>
  ),
}))

jest.mock('@/components/cv/AnalysisHistory', () => ({
  __esModule: true,
  default: () => <div data-testid="analysis-history" />,
}))

jest.mock('@/components/auth/RoleModal', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="role-modal">
      <button onClick={onClose}>close</button>
    </div>
  ),
}))

const BASE_PROPS = {
  profile: { id: 'u1', name: 'Ahmed', role: 'job_seeker' },
  userId: 'u1',
  showRoleModal: false,
  emailVerified: true,
  initialAnalysis: null,
}

describe('AnalyzeClient', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('shows verification banner when email not verified', () => {
    render(<AnalyzeClient {...BASE_PROPS} emailVerified={false} />)
    expect(screen.getByText(/تفعيل بريدك/)).toBeInTheDocument()
    expect(screen.getByText('upload-disabled')).toBeInTheDocument()
  })

  it('shows upload zone enabled when email is verified', () => {
    render(<AnalyzeClient {...BASE_PROPS} />)
    expect(screen.queryByText(/تفعيل بريدك/)).not.toBeInTheDocument()
    expect(screen.getByText('upload-enabled')).toBeInTheDocument()
  })

  it('shows initial analysis when provided', () => {
    const analysis = {
      id: 'a1', user_id: 'u1', filename: 'cv.pdf', file_path: 'u1/a1.pdf', score: 87,
      categories: { technical_skills: 91, work_experience: 85, education: 78, clarity: 94, language_quality: 80, ats_compatibility: 75 },
      recommendations: ['rec1'],
      status: 'done' as const,
      error_msg: null,
      created_at: '2025-01-01T00:00:00Z',
    }
    render(<AnalyzeClient {...BASE_PROPS} initialAnalysis={analysis} />)
    expect(screen.getByTestId('analysis-result')).toBeInTheDocument()
    expect(screen.getByText('score: 87')).toBeInTheDocument()
  })

  it('shows analyzing state and then result after upload', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'a1', filename: 'cv.pdf', score: 92,
        categories: { technical_skills: 95, work_experience: 90, education: 88, clarity: 96, language_quality: 85, ats_compatibility: 80 },
        recommendations: ['توصية'],
        status: 'done',
        created_at: '2025-01-01T00:00:00Z',
      }),
    })

    render(<AnalyzeClient {...BASE_PROPS} />)
    fireEvent.click(screen.getByText('upload-trigger'))

    expect(screen.getByText(/جاري تحليل/)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('analysis-result')).toBeInTheDocument()
    })
    expect(screen.getByText('score: 92')).toBeInTheDocument()
  })

  it('shows error message when upload fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'حدث خطأ في التحليل، حاول مجدداً' }),
    })

    render(<AnalyzeClient {...BASE_PROPS} />)
    fireEvent.click(screen.getByText('upload-trigger'))
    await waitFor(() => {
      expect(screen.getByText(/حدث خطأ في التحليل/)).toBeInTheDocument()
    })
  })

  it('shows RoleModal when showRoleModal is true', () => {
    render(<AnalyzeClient {...BASE_PROPS} showRoleModal />)
    expect(screen.getByTestId('role-modal')).toBeInTheDocument()
  })
})
