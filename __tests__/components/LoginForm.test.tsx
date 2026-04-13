import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/auth/LoginForm'

const mockSignIn = jest.fn()
jest.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signInWithPassword: mockSignIn },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}))

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders email, password fields and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/البريد الإلكتروني/)).toBeInTheDocument()
    expect(screen.getByLabelText(/كلمة المرور/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /تسجيل الدخول/ })).toBeInTheDocument()
  })

  it('shows validation error for empty email on submit', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }))
    await waitFor(() => {
      expect(screen.getByText(/البريد الإلكتروني غير صحيح/)).toBeInTheDocument()
    })
  })

  it('calls signInWithPassword with correct data on valid submit', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/البريد الإلكتروني/), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/كلمة المرور/), {
      target: { value: 'mypassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      })
    })
  })

  it('shows error message when signIn fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/البريد الإلكتروني/), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/كلمة المرور/), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الدخول/ }))

    await waitFor(() => {
      expect(
        screen.getByText(/البريد أو كلمة المرور غير صحيحة/)
      ).toBeInTheDocument()
    })
  })
})
