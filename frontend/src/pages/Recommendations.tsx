import { useState } from 'react'

const courses = [
  {
    title: 'Data Structures and Algorithms',
    provider: 'Coursera',
    instructor: 'UC San Diego',
    skill: 'DSA',
    rating: 4.8,
    duration: '6 weeks',
    level: 'Intermediate',
    tag: '🔥 Top Pick',
    color: '#2563EB',
    bg: '#EFF6FF',
    url: '#',
    match: 96,
  },
  {
    title: 'Cracking the Coding Interview',
    provider: 'LeetCode',
    instructor: '150 Problems Path',
    skill: 'DSA',
    rating: 4.9,
    duration: '60 days',
    level: 'Intermediate',
    tag: '✅ Must Do',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    url: '#',
    match: 93,
  },
  {
    title: 'System Design for Interviews',
    provider: 'Udemy',
    instructor: 'Gaurav Sen',
    skill: 'System Design',
    rating: 4.7,
    duration: '8 hours',
    level: 'Advanced',
    tag: '🎯 Google Prep',
    color: '#EA580C',
    bg: '#FFF7ED',
    url: '#',
    match: 91,
  },
  {
    title: 'Operating Systems',
    provider: 'NPTEL',
    instructor: 'IIT Bombay',
    skill: 'OS',
    rating: 4.6,
    duration: '8 weeks',
    level: 'Intermediate',
    tag: '📚 Core Subject',
    color: '#2563EB',
    bg: '#EFF6FF',
    url: '#',
    match: 88,
  },
  {
    title: 'Computer Networks',
    provider: 'GeeksforGeeks',
    instructor: 'DSA Course',
    skill: 'Networks',
    rating: 4.5,
    duration: '4 weeks',
    level: 'Intermediate',
    tag: '📚 Core Subject',
    color: '#2563EB',
    bg: '#EFF6FF',
    url: '#',
    match: 85,
  },
  {
    title: 'Full Stack Web Development',
    provider: 'Coursera',
    instructor: 'Meta',
    skill: 'Web Dev',
    rating: 4.7,
    duration: '9 months',
    level: 'Beginner',
    tag: '🚀 Project Ready',
    color: '#059669',
    bg: '#ECFDF5',
    url: '#',
    match: 80,
  },
  {
    title: 'Quantitative Aptitude Mastery',
    provider: 'Udemy',
    instructor: 'Arun Sharma',
    skill: 'Aptitude',
    rating: 4.6,
    duration: '20 hours',
    level: 'Beginner',
    tag: '📈 Improve Score',
    color: '#D97706',
    bg: '#FFFBEB',
    url: '#',
    match: 78,
  },
  {
    title: 'Google Interview Preparation',
    provider: 'GeeksforGeeks',
    instructor: 'GFG Team',
    skill: 'Interview',
    rating: 4.5,
    duration: '3 months',
    level: 'Advanced',
    tag: '🎯 Google Prep',
    color: '#EA580C',
    bg: '#FFF7ED',
    url: '#',
    match: 95,
  },
]

const providers = ['All', 'Coursera', 'Udemy', 'NPTEL', 'LeetCode', 'GeeksforGeeks']
const skillFilters = ['All', 'DSA', 'System Design', 'OS', 'Networks', 'Web Dev', 'Aptitude', 'Interview']

export default function Recommendations() {
  const [activeProvider, setActiveProvider] = useState('All')
  const [activeSkill, setActiveSkill] = useState('All')
  const [saved, setSaved] = useState<number[]>([])

  const filtered = courses.filter(c => {
    const matchProvider = activeProvider === 'All' || c.provider === activeProvider
    const matchSkill = activeSkill === 'All' || c.skill === activeSkill
    return matchProvider && matchSkill
  })

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
          Recommendations 🎯
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
          Curated courses matched to your skill gaps and Google SDE preparation
        </p>
      </div>

      {/* Provider filter */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Platform
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {providers.map(p => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              style={{
                padding: '6px 14px',
                borderRadius: 100,
                border: `1.5px solid ${activeProvider === p ? 'var(--primary)' : 'var(--border)'}`,
                background: activeProvider === p ? 'var(--secondary)' : 'var(--card)',
                color: activeProvider === p ? 'var(--primary)' : 'var(--foreground)',
                fontSize: 13,
                fontWeight: activeProvider === p ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Skill filter */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Skill Area
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skillFilters.map(s => (
            <button
              key={s}
              onClick={() => setActiveSkill(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 100,
                border: `1.5px solid ${activeSkill === s ? 'var(--accent)' : 'var(--border)'}`,
                background: activeSkill === s ? '#EFF6FF' : 'var(--card)',
                color: activeSkill === s ? 'var(--accent)' : 'var(--foreground)',
                fontSize: 13,
                fontWeight: activeSkill === s ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {filtered.map((course, i) => (
          <div
            key={i}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  background: course.bg,
                  color: course.color,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {course.tag}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: '#D97706', fontWeight: 700 }}>⭐ {course.rating}</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--foreground)', marginBottom: 4, lineHeight: 1.3 }}>
                {course.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                {course.provider} · {course.instructor}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⏱ {course.duration}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: 4 }}>
                📶 {course.level}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: course.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                🎯 {course.match}% match
              </span>
            </div>

            {/* Match bar */}
            <div style={{ height: 4, background: 'var(--muted)', borderRadius: 100, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${course.match}%`,
                  background: course.color,
                  borderRadius: 100,
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 10,
                  border: 'none',
                  background: `linear-gradient(135deg, ${course.color}, ${course.color}CC)`,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Start Course →
              </button>
              <button
                onClick={() => setSaved(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: `1.5px solid ${saved.includes(i) ? course.color : 'var(--border)'}`,
                  background: saved.includes(i) ? course.bg : 'transparent',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {saved.includes(i) ? '🔖' : '🤍'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--muted-foreground)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No courses found</div>
          <div style={{ fontSize: 14 }}>Try a different filter combination</div>
        </div>
      )}
    </div>
  )
}
