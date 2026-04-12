/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WaitlistForm from '@/components/WaitlistForm'

global.fetch = jest.fn()

describe('WaitlistForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders all form fields', () => {
    render(<WaitlistForm />)
    expect(screen.getByPlaceholderText('الاسم الكامل')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('رقم الهاتف')).toBeInTheDocument()
    expect(screen.getByLabelText('باحث عن عمل')).toBeInTheDocument()
    expect(screen.getByLabelText('شركة / مسؤول توظيف')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /سجّل الآن/i })).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    render(<WaitlistForm />)
    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))
    await waitFor(() => {
      expect(screen.getByText('تم التسجيل بنجاح!')).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback after successful submission', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    const onSuccess = jest.fn()
    render(<WaitlistForm onSuccess={onSuccess} />)
    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('shows error message on duplicate email', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }),
    })
    render(<WaitlistForm />)
    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))
    await waitFor(() => {
      expect(screen.getByText('هذا البريد الإلكتروني مسجل مسبقاً')).toBeInTheDocument()
    })
  })

  it('disables button while loading', async () => {
    let resolveRequest!: (v: any) => void
    ;(fetch as jest.Mock).mockReturnValue(
      new Promise(r => { resolveRequest = r })
    )
    render(<WaitlistForm />)
    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))
    expect(screen.getByRole('button', { name: /جاري التسجيل/i })).toBeDisabled()
    // cleanup
    resolveRequest({ ok: true, json: async () => ({ success: true }) })
  })
})
