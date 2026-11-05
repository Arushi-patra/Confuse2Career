import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { apiRequest } from '../api/api'
import { useUser } from '../context/UserContext'
import { useDarkMode } from '../hooks/useDarkMode'
import logoSvg from '../imports/logo.png'

interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useUser()
  const [dark, toggleDark] = useDarkMode()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      }) as {
        access_token: string
        token_type: string
      }

      if (!response.access_token) {
        throw new Error('Registration succeeded but no access token was returned.')
      }

      localStorage.setItem('access_token', response.access_token)

      // Fetch the newly created user's authenticated details.
      const user = await apiRequest('/auth/me') as AuthUser

      login(user)

      // A new account starts by completing its profile.
      navigate('/profile', { replace: true })

    } catch (err) {
      console.error('Registration failed:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account.'
      )

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 430,
        padding: 32,
        borderRadius: 20,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
        }}>
          <img
            src={logoSvg}
            alt="Confused2Career"
            style={{ width: 48, height: 48, objectFit: 'contain' }}
          />

          <button
            onClick={toggleDark}
            style={themeButton}
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--foreground)',
          marginBottom: 8,
        }}>
          Create your account
        </h1>

        <p style={{
          fontSize: 14,
          color: 'var(--muted-foreground)',
          marginBottom: 26,
        }}>
          Start building your personalized career roadmap.
        </p>

        <label style={labelStyle}>Full Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
          autoComplete="name"
          style={inputStyle}
        />

        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          style={inputStyle}
        />

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--muted-foreground)',
          margin: '10px 0 20px',
        }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={e => setShowPassword(e.target.checked)}
          />
          Show password
        </label>

        {error && (
          <div style={{
            color: '#DC2626',
            background: '#FEF2F2',
            borderRadius: 8,
            padding: 12,
            fontSize: 13,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => void handleRegister()}
          disabled={loading}
          style={{
            ...primaryButton,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--muted-foreground)',
          marginTop: 22,
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 650,
  color: 'var(--muted-foreground)',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 13,
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  fontSize: 14,
  marginBottom: 18,
}

const primaryButton: React.CSSProperties = {
  width: '100%',
  padding: 14,
  border: 'none',
  borderRadius: 10,
  background: 'var(--primary)',
  color: '#fff',
  fontWeight: 750,
  fontSize: 14,
  cursor: 'pointer',
}

const themeButton: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 9,
  border: '1px solid var(--border)',
  background: 'var(--background)',
  cursor: 'pointer',
}