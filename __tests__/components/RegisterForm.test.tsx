import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterForm from '@/components/auth/RegisterForm'

const mockSignUp = jest.fn()
jest.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signUp: mockSignUp },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('RegisterForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders all required fields', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/الاسم الكامل/)).toBeInTheDocument()
    expect(screen.getByLabelText(/البريد الإلكتروني/)).toBeInTheDocument()
    expect(screen.getByLabelText(/كلمة المرور/)).toBeInTheDocument()
    expect(screen.getByText(/باحث عن عمل/)).toBeInTheDocument()
    expect(screen.getByText(/مسؤول توظيف/)).toBeInTheDocument()
  })

  it('shows password error when shorter than 8 chars', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByLabelText(/الاسم الكامل/), { target: { value: 'Ahmed' } })
    fireEvent.change(screen.getByLabelText(/البريد الإلكتروني/), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/كلمة المرور/), { target: { value: 'short' } })
    fireEvent.click(screen.getByText(/باحث عن عمل/))
    fireEvent.click(screen.getByRole('button', { name: /إنشاء حساب/ }))
    await waitFor(() => {
      expect(screen.getByText(/8 أحرف/)).toBeInTheDocument()
    })
  })

  it('calls signUp with correct data when form is valid', async () => {
    mockSignUp.mockResolvedValue({ error: null, data: { user: { id: '123' } } })
    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/الاسم الكامل/), { target: { value: 'Ahmed Ali' } })
    fireEvent.change(screen.getByLabelText(/البريد الإلكتروني/), { target: { value: 'ahmed@example.com' } })
    fireEvent.change(screen.getByLabelText(/كلمة المرور/), { target: { value: 'securePass123' } })
    fireEvent.click(screen.getByText(/باحث عن عمل/))
    fireEvent.click(screen.getByRole('button', { name: /إنشاء حساب/ }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'ahmed@example.com',
          password: 'securePass123',
          options: expect.objectContaining({
            data: expect.objectContaining({ name: 'Ahmed Ali', role: 'job_seeker' }),
          }),
        })
      )
    })
  })
})
