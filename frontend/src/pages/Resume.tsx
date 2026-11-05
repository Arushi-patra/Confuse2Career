import { useEffect, useState } from 'react'
import { apiRequest } from '../api/api'

type ResumeData = {
  id: number
  target_role?: string | null
  ats_score: number
  resume_content: string
  matched_keywords?: string[]
  missing_keywords?: string[]
  suggestions?: string[]
}

type ResumeAnalysis = {
  message: string
  resume_id: number
  ats_score: number
  matched_keywords: string[]
  missing_keywords: string[]
  suggestions: string[]
}

export default function Resume() {
  const [activeTab, setActiveTab] = useState<'preview' | 'analysis'>('preview')
  const [copied, setCopied] = useState(false)
  
  const [resumeData, setResumeData] =
    useState<ResumeData | null>(null) 

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [targetRole, setTargetRole] =
    useState('')

  const loadLatestResume = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await apiRequest('/resume/latest')
      const savedResume = data as ResumeData

      setResumeData(savedResume)

      setAnalysis({
        message: 'Saved resume analysis loaded.',
        resume_id: savedResume.id,
        ats_score: savedResume.ats_score,
        matched_keywords: savedResume.matched_keywords ?? [],
        missing_keywords: savedResume.missing_keywords ?? [],
        suggestions: savedResume.suggestions ?? [],
      })

      if (savedResume.target_role) {
        setTargetRole(savedResume.target_role)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : ''

      if (message.toLowerCase().includes('no resume found')) {
        setResumeData(null)
        setAnalysis(null)
        setError('')
      } else {
        setError(message || 'Failed to load saved resume.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLatestResume()
  }, [])

  const analyzeResume = async () => {
    if (!selectedFile) {
      setError('Please select a PDF resume first.')
      return
    }

    if (!targetRole.trim()) {
      setError('Please enter your target role.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()

      formData.append(
        'target_role',
        targetRole
      )

      formData.append(
        'file',
        selectedFile
      )

      const data = await apiRequest(
        '/resume/analyze',
        {
          method: 'POST',
          body: formData,
        }
      )

      const result =
        data as ResumeAnalysis

      setAnalysis(result)

      // Update the main resume data immediately.
      setResumeData({
        id: result.resume_id,
        ats_score: result.ats_score,
        resume_content: '',
      })

      // Load the complete saved data from database.
      await loadLatestResume()
    } catch (error) {
      console.error(
        'Failed to analyze resume:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Could not analyze resume.'
      )
    } finally {
      setLoading(false)
    }
  }

  // const handleCopy = () => {
  //   setCopied(true)
  //   setTimeout(() => setCopied(false), 2000)
  // }
  const handleCopy = async () => {
    if (!resumeData?.resume_content) {
      setError('No resume content available to copy.')
      return
    }

    try {
      await navigator.clipboard.writeText(resumeData.resume_content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the resume. Please try again.')
    }
  }

  const handleDownload = async () => {
    try {
      setError('')

      const response = await apiRequest('/resume/download') as Response
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = 'my-resume.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not download your resume.'
      )
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
          ATS Resume 📄
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
          Auto-updated resume optimized for Applicant Tracking Systems
        </p>
      </div>

      {/* Upload and analyze resume */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Analyze Your Resume
        </h2>

        <p
          style={{
            fontSize: 13,
            color: 'var(--muted-foreground)',
            marginBottom: 18,
          }}
        >
          Upload your resume and check its ATS score
          for your target role.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Target role (e.g. Software Engineer)"
            value={targetRole}
            onChange={(event) =>
              setTargetRole(event.target.value)
            }
            style={{
              flex: '1 1 220px',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: 14,
            }}
          />

          <input
            type="file"
            accept=".pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
            style={{
              fontSize: 13,
            }}
          />

          <button
            onClick={() => void analyzeResume()}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: loading
                ? '#93C5FD'
                : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            {loading
              ? 'Processing...'
              : 'Analyze Resume'}
          </button>
        </div>

        {selectedFile && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: 'var(--muted-foreground)',
            }}
          >
            Selected: {selectedFile.name}
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              color: '#DC2626',
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* ATS Score banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 24px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '4px solid #059669',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 18, color: '#059669', lineHeight: 1 }}>
            {loading ? '...' : resumeData?.ats_score ?? '--'}
          </span>
          <span style={{ fontSize: 9, color: 'var(--muted-foreground)' }}>ATS</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: 15 }}>
            {resumeData ? 'Your Resume ATS Score' : 'No ATS Analysis Yet'}
          </div>

          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            {resumeData
              ? `${analysis?.suggestions.length ?? 0} suggestions available for your resume.`
              : 'Upload and analyze your resume to see your actual ATS score.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            disabled={!resumeData}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            onClick={() => void handleDownload()}
            disabled={!resumeData}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--muted)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['preview', 'analysis'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 20px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === tab ? 'var(--card)' : 'transparent',
              color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              textTransform: 'capitalize',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'preview' ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '32px 40px',
            maxWidth: 780,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            minHeight: 250,
          }}
        >
          {loading ? (
            <p style={{ color: '#64748B' }}>
              Loading your resume...
            </p>
          ) : resumeData?.resume_content ? (
            <>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 16,
                }}
              >
                Your Uploaded Resume
              </h2>

              {resumeData.target_role && (
                <p
                  style={{
                    fontSize: 13,
                    color: '#64748B',
                    marginBottom: 16,
                  }}
                >
                  Target role: {resumeData.target_role}
                </p>
              )}

              <div
                style={{
                  color: '#334155',
                  fontFamily: '"Times New Roman", Georgia, serif',
                  fontSize: 14,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                }}
              >
                {resumeData.resume_content}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <h2 style={{ color: '#0F172A', fontSize: 18 }}>
                No resume uploaded yet
              </h2>

              <p style={{ color: '#64748B', fontSize: 14 }}>
                Upload your PDF resume above to see its preview here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Real backend ATS analysis */}
          {loading && (
            <p style={{ color: 'var(--muted-foreground)' }}>
              Loading saved resume analysis...
            </p>
          )}

          {error && (
            <p style={{ color: '#DC2626', fontSize: 13 }}>
              {error}
            </p>
          )}

          {analysis && (
            <>
              {/* ATS Score */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  Backend ATS Score
                </div>

                <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
                  {analysis.ats_score}/100
                </div>
              </div>

              {/* Matched Keywords */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                  Matched Keywords
                </div>

                <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                  {analysis.matched_keywords.length > 0
                    ? analysis.matched_keywords.join(', ')
                    : 'No matching keywords found.'}
                </p>
              </div>

              {/* Missing Keywords */}
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 16,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#92400E' }}>
                  Missing Keywords
                </div>

                <p style={{ fontSize: 13, color: '#92400E' }}>
                  {analysis.missing_keywords.length > 0
                    ? analysis.missing_keywords.join(', ')
                    : 'No important keywords are missing.'}
                </p>
              </div>

              {/* Suggestions */}
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                  Suggestions
                </div>

                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {analysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: 13,
                        color: 'var(--muted-foreground)',
                        marginBottom: 8,
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {!loading && !error && !analysis && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
              Upload and analyze your resume to see your ATS analysis here.
            </p>
          )}

        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          borderBottom: '1px solid #CBD5E1',
          paddingBottom: 4,
          marginBottom: 10,
          color: '#1E293B',
          fontFamily: '"Times New Roman", serif',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function ExperienceItem({
  title,
  company,
  date,
  bullets,
}: {
  title: string
  company: string
  date: string
  bullets: string[]
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748B', flexShrink: 0 }}>{date}</div>
      </div>
      <div style={{ fontSize: 13, color: '#2563EB', marginBottom: 6, fontStyle: 'italic' }}>{company}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 2 }}>
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}
