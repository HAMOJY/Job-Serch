import { render, screen, fireEvent } from '@testing-library/react'
import UploadZone from '@/components/cv/UploadZone'

describe('UploadZone', () => {
  it('renders drag zone and upload button', () => {
    render(<UploadZone onFile={jest.fn()} />)
    expect(screen.getByText(/اسحب وأفلت/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تحليل بالذكاء الاصطناعي/ })).toBeInTheDocument()
  })

  it('shows selected filename after file is chosen', () => {
    render(<UploadZone onFile={jest.fn()} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
  })

  it('shows error for unsupported file type and does not call onFile', () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'cv.txt', { type: 'text/plain' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    expect(screen.getByText(/الملف يجب أن يكون PDF أو Word/)).toBeInTheDocument()
    expect(onFile).not.toHaveBeenCalled()
  })

  it('calls onFile with the selected file when submit button is clicked', () => {
    const onFile = jest.fn()
    render(<UploadZone onFile={onFile} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)
    fireEvent.click(screen.getByRole('button', { name: /تحليل بالذكاء الاصطناعي/ }))
    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('shows disabled overlay when disabled prop is true', () => {
    render(<UploadZone onFile={jest.fn()} disabled />)
    expect(screen.getByTestId('upload-disabled-overlay')).toBeInTheDocument()
  })
})
