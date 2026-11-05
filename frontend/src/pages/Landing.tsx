import { useNavigate } from 'react-router'
import { useState, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import logoSvg from '../imports/logo.png'

const steps = [
  {
    num: '01',
    icon: '👤',
    title: 'Onboarding',
    desc: 'Share your placement date, study hours, dream company & skill level.',
    color: '#EFF6FF',
    accent: '#2563EB',
  },
  {
    num: '02',
    icon: '🧠',
    title: 'AI Analysis',
    desc: 'AI understands your profile, identifies strengths, gaps and builds your plan.',
    color: '#EFF6FF',
    accent: '#1D4ED8',
  },
  {
    num: '03',
    icon: '📋',
    title: 'Personalized Plan',
    desc: 'Daily plan across DSA, Core Subjects, Aptitude, Projects & Certifications.',
    color: '#ECFDF5',
    accent: '#059669',
  },
  {
    num: '04',
    icon: '🚀',
    title: 'Daily Execution',
    desc: "Follow your personalized workspace and complete today's tasks with guidance.",
    color: '#FFF7ED',
    accent: '#EA580C',
  },
  {
    num: '05',
    icon: '📊',
    title: 'Verify & Track',
    desc: 'Assessments verified. Progress, scores and skills are continuously tracked.',
    color: '#EFF6FF',
    accent: '#2563EB',
  },
  {
    num: '06',
    icon: '🏆',
    title: 'Placement Ready',
    desc: 'Employability score improves, resume auto-updates and you get shortlisted.',
    color: '#FFFBEB',
    accent: '#D97706',
  },
]

const features = [
  {
    icon: '🗺️',
    title: 'Smart Roadmap',
    desc: 'AI generates a step-by-step personalized learning roadmap based on your timeline and dream company.',
    tag: 'Personalized',
  },
  {
    icon: '📄',
    title: 'ATS Resume Builder',
    desc: 'Automatically creates and continuously updates your resume optimized for Applicant Tracking Systems.',
    tag: 'Auto-updated',
  },
  {
    icon: '📈',
    title: 'Skill Dashboard',
    desc: 'Evaluates and rates your current skills, tracks overall preparation progress with visual analytics.',
    tag: 'Real-time',
  },
  {
    icon: '🎯',
    title: 'Smart Recommendations',
    desc: 'Curated courses from Coursera, Udemy, NPTEL, LeetCode, GeeksforGeeks matched to your skill gaps.',
    tag: 'AI-Powered',
  },
]

const companies = ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Meta', 'Flipkart', 'Infosys', 'TCS']

export default function Landing() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [dark, toggleDark] = useDarkMode()

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--card)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <img
              src={logoSvg}
              alt="Confused2Career logo"
              style={{ width: 40, height: 40, objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--foreground)',
                letterSpacing: '-0.3px',
              }}
            >
              Confused<span style={{ color: 'var(--primary)' }}>2</span>Career
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={toggleDark}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: '1.5px solid var(--primary)',
                background: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                paddingTop: 2,
                paddingBottom: 4,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 8,
                border: '1.5px solid var(--primary)',
                background: 'transparent',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                paddingTop: 2,
                paddingBottom: 5,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 100,
              background: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 28,
              border: '1px solid #BFDBFE',
            }}
          >
            <span></span>Career Guidance Platform
          </div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 48,
              fontWeight: 800,
              lineHeight: 1.1,
              color: 'var(--foreground)',
              marginBottom: 24,
              letterSpacing: '-1.5px',
            }}
          >
            From{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Confusion
            </span>{' '}
            to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #059669, #0891B2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Career Readiness.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--muted-foreground)',
              lineHeight: 1.7,
              marginBottom: 40,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            One platform that turns your placement timeline, study hours, and dream company into a
            structured, personalized career plan — roadmap, resume, skills, and recommendations
            all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 36px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(37,99,235,0.45)'
              }}
              onMouseLeave={e => {
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.boxShadow = '0 8px 32px rgba(37,99,235,0.35)'
              }}
            >
              Create My Career Plan →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '14px 36px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#ffff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(37,99,235,0.45)'
              }}
              onMouseLeave={e => {
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.boxShadow = '0 8px 32px rgba(37,99,235,0.35)'
              }}
            >
              View Demo Dashboard  →
            </button>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              justifyContent: 'center',
              marginTop: 60,
              flexWrap: 'wrap',
            }}
          >
            {[
              { val: '12K+', label: 'Students Placed' },
              { val: '94%', label: 'Placement Rate' },
              { val: '200+', label: 'Dream Companies' },
              { val: '4.9★', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1,
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Journey */}
      <section
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '72px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              User Journey
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.8px',
                color: 'var(--foreground)',
                marginBottom: 16,
              }}
            >
              One Profile. One System. One Journey.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted-foreground)', maxWidth: 500, margin: '0 auto' }}>
              From confusion to placement readiness — every step guided by AI.
            </p>
          </div>

          {/* Journey steps */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.num}
                onClick={() => setActiveStep(i)}
                style={{
                  padding: '24px 20px',
                  borderRadius: 16,
                  background: activeStep === i ? step.color : 'var(--muted)',
                  border: `2px solid ${activeStep === i ? step.accent : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 14,
                    fontSize: 11,
                    fontWeight: 700,
                    color: activeStep === i ? step.accent : 'var(--muted-foreground)',
                    fontFamily: 'Outfit, sans-serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: activeStep === i ? step.accent : 'var(--foreground)',
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Core Features
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.8px',
              color: 'var(--foreground)',
            }}
          >
            Everything you need to get placed
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {features.map(f => (
            <div
              key={f.title}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '32px 28px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 16px 48px rgba(37,99,235,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 100,
                  background: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 12,
                  letterSpacing: '0.5px',
                }}
              >
                {f.tag}
              </div>
              <h3
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  marginBottom: 10,
                  letterSpacing: '-0.3px',
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Companies ticker */}
      <section
        style={{
          background: 'var(--secondary)',
          padding: '32px 24px',
          overflow: 'hidden',
          borderTop: '1px solid #BFDBFE',
          borderBottom: '1px solid #BFDBFE',
          boxShadow: 'inset 0 8px 16px rgba(37,99,235,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 18, color: 'var(--secondary-foreground)', fontWeight: 600 }}>
            Students placed at top companies
          </span>
        </div>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {companies.map(c => (
            <span
              key={c}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--secondary-foreground)',
                opacity: 0.8,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* CTA
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            borderRadius: 28,
            padding: '60px 40px',
            color: '#fff',
          }}
        >
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.8px',
              marginBottom: 16,
            }}
          >
            Start your journey today
          </h2>
          <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.6, marginBottom: 36 }}>
            Answer 3 simple questions and get your personalized career plan in under 60 seconds.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 40px',
              borderRadius: 12,
              border: 'none',
              background: '#fff',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.transform = 'translateY(-2px)')}
            onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'translateY(0)')}
          >
            Create My Career Plan →
          </button>
        </div>
      </section> */}

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px',
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
