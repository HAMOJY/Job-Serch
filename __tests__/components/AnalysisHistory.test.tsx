import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AnalysisHistory from '@/components/cv/AnalysisHistory'

jest.mock('@/components/cv/AnalysisResult', () => ({
  __esModule: true,
  default: ({ analysis }: { analysis: { score: number } }) => (
    <div data-testid="analysis-result-expanded">score: {analysis.score}</div>
  ),
}))

beforeEach(() => {
  ;(global.fetch as jest.Mock).mockReset()
})

describe('AnalysisHistory', () => {
  it('shows loading state initially', () => {
    ;(global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}))
    render(<AnalysisHistory refreshTrigger={0} />)
    expect(screen.getByText(/جاري التحميل/)).toBeInTheDocument()
  })

  it('shows empty state when no history', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    render(<AnalysisHistory refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/لا يوجد تحليل سابق/)).toBeInTheDocument()
    })
  })

  it('renders list of past analyses', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'a1', filename: 'cv.pdf', score: 87, status: 'done',
          categories: { technical_skills: 90, work_experience: 85, education: 80, clarity: 92 },
          recommendations: [], created_at: '2025-04-14T10:00:00Z',
        },
        {
          id: 'a2', filename: 'resume.docx', score: 72, status: 'done',
          categories: { technical_skills: 70, work_experience: 75, education: 68, clarity: 74 },
          recommendations: [], created_at: '2025-03-01T10:00:00Z',
        },
      ],
    })
    render(<AnalysisHistory refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText('cv.pdf')).toBeInTheDocument()
      expect(screen.getByText('resume.docx')).toBeInTheDocument()
    })
  })

  it('re-fetches when refreshTrigger changes', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    const { rerender } = render(<AnalysisHistory refreshTrigger={0} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    rerender(<AnalysisHistory refreshTrigger={1} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2))
  })

  it('shows error message when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) })
    render(<AnalysisHistory refreshTrigger={0} />)
    await waitFor(() => {
      expect(screen.getByText(/تعذّر تحميل السجل/)).toBeInTheDocument()
    })
  })

  it('expands analysis details when row is clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'a1', filename: 'cv.pdf', score: 87, status: 'done',
          categories: { technical_skills: 90, work_experience: 85, education: 80, clarity: 92 },
          recommendations: ['rec1'], created_at: '2025-04-14T10:00:00Z',
        },
      ],
    })
    render(<AnalysisHistory refreshTrigger={0} />)
    await waitFor(() => expect(screen.getByText('cv.pdf')).toBeInTheDocument())
    fireEvent.click(screen.getByText('cv.pdf'))
    expect(screen.getByTestId('analysis-result-expanded')).toBeInTheDocument()
  })
})
