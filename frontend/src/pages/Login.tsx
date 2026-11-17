import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useUser } from '../context/UserContext'
import { useDarkMode } from '../hooks/useDarkMode'
import logoSvg from '../imports/logo.png'
import { apiRequest, ApiError } from "../api/api"

export default function Login() {
  const navigate = useNavigate()
  const { login, refreshProfile } = useUser()
  const [dark, toggleDark] = useDarkMode()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleLogin = async () => {
    const e = validate()

    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setLoading(true)
    setErrors({})

    let loginSuccessful = false

    try {
      // STEP 1: Authenticate user
      const formData = new URLSearchParams()

      formData.append("username", email.trim().toLowerCase())
      formData.append("password", password)

      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: formData,
      })

      localStorage.setItem(
        "access_token",
        response.access_token
      )

    if (response.refresh_token) {
      localStorage.setItem(
        "refresh_token",
        response.refresh_token
        )
      }

      loginSuccessful = true

      // STEP 2: Fetch authenticated user
      const user = await apiRequest("/auth/me") as {
        id: number
        name: string
        email: string
        role: string
      }

      login(user)

      // STEP 3: Fetch and load the saved profile
      const profileFound = await refreshProfile(user)

      if (!profileFound) {
        navigate("/profile", { replace: true })
        return
      }

      // STEP 4: Check whether roadmap exists
      try {
        await apiRequest("/roadmap")

        // Existing roadmap found
        navigate("/dashboard", { replace: true })

      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {

          // Profile exists, but roadmap does not.
          // Send user to onboarding.
          navigate("/onboarding", { replace: true })

        } else {
          throw error
        }
      }

    } catch (error) {
      console.error("Login process error:", error)

      if (!loginSuccessful) {
        if (error instanceof ApiError && error.status === 401) {
          setErrors({
            email: "Invalid email or password",
          })
        } else if (error instanceof ApiError) {
          setErrors({
            email: error.message,
          })
        } else {
          setErrors({
            email: "Unable to connect to the server. Please try again.",
          })
        }
      } else {
        setErrors({
          email: "You are signed in, but something went wrong while loading your profile. Please try again.",
        })
      }

    } finally {
      setLoading(false)
    }
  }

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(147,197,253,0.2)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoSvg} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--foreground)' }}>
            Confused<span style={{ color: 'var(--primary)' }}>2</span>Career
          </span>
        </div>
        <button onClick={toggleDark} style={{ width: 36, height: 36, borderRadius: 8, border: 'var (--primary)', background: 'var(--muted)', cursor: 'pointer', fontSize: 16, color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, borderRadius: 24, padding: '44px 40px', ...glass }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}>
            <span style={{ fontSize: 24 }}>🔐</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--foreground)', marginBottom: 8, letterSpacing: '-0.4px' }}>
            Welcome Back !!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
            Sign in to continue your career journey with us.
            <br/>If you don't have an account, create a profile to get started.
          </p>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: '0.3px' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
            placeholder="arjun@example.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: `1.5px solid ${errors.email ? '#F87171' : 'rgba(147,197,253,0.25)'}`,
              background: 'rgba(255,255,255,0.06)',
              color: '#E2F0FF',
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#3B82F6')}
            onBlur={e => (e.target.style.borderColor = errors.email ? '#F87171' : 'rgba(147,197,253,0.25)')}
          />
          {errors.email && <div style={{ fontSize: 12, color: '#F87171', marginTop: 5 }}>{errors.email}</div>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: '0.3px' }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 44px 12px 14px',
                borderRadius: 10,
                border: `1.5px solid ${errors.password ? '#F87171' : 'rgba(147,197,253,0.25)'}`,
                background: 'rgba(255,255,255,0.06)',
                color: '#E2F0FF',
                fontSize: 15,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              onFocus={e => (e.target.style.borderColor = '#3B82F6')}
              onBlur={e => (e.target.style.borderColor = errors.password ? '#F87171' : 'rgba(147,197,253,0.25)')}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted-foreground)', lineHeight: 1 }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <div style={{ fontSize: 12, color: '#F87171', marginTop: 5 }}>{errors.password}</div>}
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: 'right', marginBottom: 28 }}>
          <span style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
            Forgot password?
          </span>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.4)',
            transition: 'all 0.2s',
            letterSpacing: '0.2px',
          }}
        >
          {loading ? '⏳ Signing in...' : 'Sign In →'}
        </button>
        <p style={{
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--muted-foreground)',
          marginTop: 20,
        }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Create Account
          </Link>
        </p>

        {/* <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--muted-foreground)' }}>
          Don&apos;t have an account?{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            Create Profile →
          </span>
        </div> */}
      </div>

       <footer
        style={{
          borderTop: 'px solid var(--border)',
          padding: '50px',
          textAlign: 'center',
          color: 'var(--muted-foreground)',
          fontSize: 13,
        }}
      >
         © 2026 Confused2Career. <br/>Helping students navigate from confusion to career readiness.
        <br/>Focused on providing personalized guidance, skill development, and placement support for a successful career journey.
        <br />Archi Jagdev Mohapatra, Arushi Patra, Aishwarya Prusty, Lopamudra Nayak, Sushree Sangita Mandal, Tannistha Ash
        <br/> @ KIIT University, Bhubaneswar, Odisha, India
        
      
      </footer>
    </div>
  )
}
