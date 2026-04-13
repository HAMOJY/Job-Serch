/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react'
import OAuthButtons from '@/components/auth/OAuthButtons'

// Mock createBrowserSupabaseClient
const mockSignInWithOAuth = jest.fn()
jest.mock('@/lib/supabase-browser', () => ({
  createBrowserSupabaseClient: () => ({
    auth: { signInWithOAuth: mockSignInWithOAuth },
  }),
}))

describe('OAuthButtons', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockResolvedValue({ error: null })
  })

  it('renders Google and LinkedIn buttons', () => {
    render(<OAuthButtons />)
    expect(screen.getByText(/Google/)).toBeInTheDocument()
    expect(screen.getByText(/LinkedIn/)).toBeInTheDocument()
  })

  it('calls signInWithOAuth with google on Google button click', async () => {
    render(<OAuthButtons />)
    fireEvent.click(screen.getByText(/Google/))
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    )
  })

  it('calls signInWithOAuth with linkedin_oidc on LinkedIn button click', async () => {
    render(<OAuthButtons />)
    fireEvent.click(screen.getByText(/LinkedIn/))
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'linkedin_oidc' })
    )
  })
})
