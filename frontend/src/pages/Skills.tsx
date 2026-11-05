import { useEffect, useState } from 'react'
import { apiRequest } from '../api/api'

type SkillAnalysisResponse = {
  dsa: number
  development: number
  aptitude: number
  resume: number
  interview: number
  career_readiness_score: number
  level: string
}

type SkillInput = {
  dsa: number
  development: number
  aptitude: number
  resume: number
  interview: number
}

function scoreLabel(score: number) {
  if (score >= 80) {
    return {
      label: 'Strong',
      color: '#059669',
      bg: '#ECFDF5',
    }
  }

  if (score >= 60) {
    return {
      label: 'Good',
      color: '#2563EB',
      bg: '#EFF6FF',
    }
  }

  if (score >= 40) {
    return {
      label: 'Needs Work',
      color: '#D97706',
      bg: '#FFFBEB',
    }
  }

  return {
    label: 'Weak',
    color: '#DC2626',
    bg: '#FEF2F2',
  }
}

export default function Skills() {
  const [formData, setFormData] = useState<SkillInput>({
    dsa: 50,
    development: 50,
    aptitude: 50,
    resume: 50,
    interview: 50,
  })

  const [result, setResult] =
    useState<SkillAnalysisResponse | null>(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const loadSavedSkills = async () => {
    try {
      setPageLoading(true)

      const data = await apiRequest('/skills/latest')

      const savedResult = data as SkillAnalysisResponse

      setResult(savedResult)

      setFormData({
        dsa: savedResult.dsa,
        development: savedResult.development,
        aptitude: savedResult.aptitude,
        resume: savedResult.resume,
        interview: savedResult.interview,
      })

      setError('')
    } catch (error) {
      console.error(
        'Failed to load saved skills:',
        error
      )

      // A new user may not have analyzed their skills yet.
      // In that case, we simply show the empty form.
      setResult(null)
    } finally {
      setPageLoading(false)
    }
  }
  useEffect(() => {
    void loadSavedSkills()
  }, [])

  const handleChange = (
    field: keyof SkillInput,
    value: string
  ) => {
    let score = Number(value)

    if (Number.isNaN(score)) {
      score = 0
    }

    score = Math.max(0, Math.min(100, score))

    setFormData((previous) => ({
      ...previous,
      [field]: score,
    }))
  }

  const analyzeSkills = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(
        '/skills/analyze',
        {
          method: 'POST',
          body: JSON.stringify(formData),
        }
      )

      setResult(data as SkillAnalysisResponse)
    } catch (error) {
      console.error(
        'Failed to analyze skills:',
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Could not analyze skills.'
      )
    } finally {
      setLoading(false)
    }
  }

  const skills = result
    ? [
        {
          name: 'DSA',
          score: result.dsa,
          category: 'Technical Skills',
          color: '#2563EB',
        },
        {
          name: 'Development',
          score: result.development,
          category: 'Technical Skills',
          color: '#2563EB',
        },
        {
          name: 'Aptitude',
          score: result.aptitude,
          category: 'Career Preparation',
          color: '#D97706',
        },
        {
          name: 'Resume',
          score: result.resume,
          category: 'Career Preparation',
          color: '#059669',
        },
        {
          name: 'Interview',
          score: result.interview,
          category: 'Career Preparation',
          color: '#EA580C',
        },
      ]
    : []

  const categories = [
    ...new Set(
      skills.map((skill) => skill.category)
    ),
  ]

  const prioritySkills = skills
    .filter((skill) => skill.score < 60)
    .sort((a, b) => a.score - b.score)

  return (
    <div>
      {pageLoading && (
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          Loading your saved skill analysis...
        </p>
      )}
      
      {/* Page heading */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.4px',
            marginBottom: 4,
          }}
        >
          Skill Dashboard 📊
        </h1>

        <p
          style={{
            fontSize: 14,
            color: 'var(--muted-foreground)',
          }}
        >
          Analyze your current skills and check your
          career readiness.
        </p>
      </div>

      {/* Skill input form */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 24,
          marginBottom: 28,
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
          Analyze Your Skills
        </h2>

        <p
          style={{
            fontSize: 13,
            color: 'var(--muted-foreground)',
            marginBottom: 20,
          }}
        >
          Rate your current skill level from 0 to 100.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {(
            [
              ['dsa', 'DSA'],
              ['development', 'Development'],
              ['aptitude', 'Aptitude'],
              ['resume', 'Resume'],
              ['interview', 'Interview'],
            ] as [
              keyof SkillInput,
              string
            ][]
          ).map(([field, label]) => (
            <div
              key={field}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {label}
              </label>

              <input
                type="number"
                min="0"
                max="100"
                value={formData[field]}
                onChange={(event) =>
                  handleChange(
                    field,
                    event.target.value
                  )
                }
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border:
                    '1px solid var(--border)',
                  background:
                    'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => void analyzeSkills()}
          disabled={loading}
          style={{
            marginTop: 20,
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
            ? 'Analyzing...'
            : 'Analyze Skills'}
        </button>

        {error && (
          <p
            style={{
              marginTop: 14,
              color: '#DC2626',
              fontSize: 13,
            }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Show results only after backend response */}
      {result && (
        <>
          {/* Overall score */}
          <div
            style={{
              background:
                'linear-gradient(135deg, #2563EB, #1D4ED8)',
              borderRadius: 20,
              padding: '28px 32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background:
                  'rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily:
                    'Outfit, sans-serif',
                  fontSize: 28,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {result.career_readiness_score}
              </span>

              <span
                style={{
                  fontSize: 11,
                  opacity: 0.8,
                }}
              >
                /100
              </span>
            </div>

            <div>
              <div
                style={{
                  fontFamily:
                    'Outfit, sans-serif',
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                Career Readiness Score
              </div>

              <div
                style={{
                  opacity: 0.85,
                  fontSize: 14,
                }}
              >
                Your current level is{' '}
                <strong>{result.level}</strong>.
                Keep improving your weaker areas to
                increase your placement readiness.
              </div>
            </div>
          </div>

          {/* Skills by category */}
          {categories.map((category) => {
            const categorySkills =
              skills.filter(
                (skill) =>
                  skill.category === category
              )

            return (
              <div
                key={category}
                style={{
                  background: 'var(--card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 20,
                  padding: 24,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily:
                      'Outfit, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 20,
                  }}
                >
                  {category}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  {categorySkills.map(
                    (skill) => {
                      const status =
                        scoreLabel(skill.score)

                      return (
                        <div
                          key={skill.name}
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: 16,
                          }}
                        >
                          <div
                            style={{
                              width: 120,
                              fontSize: 14,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {skill.name}
                          </div>

                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              background:
                                'var(--muted)',
                              borderRadius: 100,
                              overflow:
                                'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${skill.score}%`,
                                background:
                                  skill.color,
                                borderRadius: 100,
                                transition:
                                  'width 0.8s ease',
                              }}
                            />
                          </div>

                          <div
                            style={{
                              width: 36,
                              textAlign:
                                'right',
                              fontSize: 14,
                              fontWeight: 700,
                              color:
                                skill.color,
                              flexShrink: 0,
                            }}
                          >
                            {skill.score}
                          </div>

                          <div
                            style={{
                              padding: '3px 10px',
                              borderRadius: 100,
                              background:
                                status.bg,
                              color:
                                status.color,
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                              minWidth: 90,
                              textAlign:
                                'center',
                            }}
                          >
                            {status.label}
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            )
          })}

          {/* Priority skill gaps */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily:
                  'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#92400E',
                marginBottom: 16,
              }}
            >
              ⚠️ Priority Skill Gaps
            </div>

            {prioritySkills.length === 0 ? (
              <p
                style={{
                  color: '#92400E',
                  fontSize: 14,
                }}
              >
                Great job! No major skill gaps found.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                }}
              >
                {prioritySkills.map(
                  (skill) => (
                    <div
                      key={skill.name}
                      style={{
                        padding:
                          '12px 14px',
                        borderRadius: 12,
                        background:
                          '#FFFFFF',
                        border:
                          '1px solid #FDE68A',
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {skill.name}
                      </span>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#D97706',
                        }}
                      >
                        {skill.score}/100
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}





// const skills = [
//   { name: 'Java', score: 82, category: 'Programming', color: '#2563EB' },
//   { name: 'Python', score: 75, category: 'Programming', color: '#2563EB' },
//   { name: 'DSA', score: 64, category: 'CS Fundamentals', color: '#1D4ED8' },
//   { name: 'SQL', score: 71, category: 'CS Fundamentals', color: '#1D4ED8' },
//   { name: 'Operating Systems', score: 58, category: 'CS Fundamentals', color: '#1D4ED8' },
//   { name: 'Computer Networks', score: 45, category: 'CS Fundamentals', color: '#1D4ED8' },
//   { name: 'React', score: 79, category: 'Web Dev', color: '#0891B2' },
//   { name: 'Node.js', score: 55, category: 'Web Dev', color: '#0891B2' },
//   { name: 'System Design', score: 38, category: 'Advanced', color: '#EA580C' },
//   { name: 'Problem Solving', score: 70, category: 'Aptitude', color: '#D97706' },
//   { name: 'Verbal Ability', score: 85, category: 'Aptitude', color: '#D97706' },
//   { name: 'Quantitative', score: 62, category: 'Aptitude', color: '#D97706' },
// ]

// function scoreLabel(s: number) {
//   if (s >= 80) return { label: 'Strong', color: '#059669', bg: '#ECFDF5' }
//   if (s >= 60) return { label: 'Good', color: '#2563EB', bg: '#EFF6FF' }
//   if (s >= 40) return { label: 'Needs Work', color: '#D97706', bg: '#FFFBEB' }
//   return { label: 'Weak', color: '#DC2626', bg: '#FEF2F2' }
// }

// const categories = [...new Set(skills.map(s => s.category))]

// export default function Skills() {
//   const overall = Math.round(skills.reduce((acc, s) => acc + s.score, 0) / skills.length)

//   return (
//     <div>
//       <div style={{ marginBottom: 28 }}>
//         <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
//           Skill Dashboard 📊
//         </h1>
//         <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
//           AI-evaluated skill ratings based on your quiz performance and activity
//         </p>
//       </div>

//       {/* Overall score */}
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
//           borderRadius: 20,
//           padding: '28px 32px',
//           color: '#fff',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 28,
//           marginBottom: 28,
//         }}
//       >
//         <div
//           style={{
//             width: 80,
//             height: 80,
//             borderRadius: '50%',
//             background: 'rgba(255,255,255,0.2)',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             flexShrink: 0,
//           }}
//         >
//           <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
//             {overall}
//           </span>
//           <span style={{ fontSize: 11, opacity: 0.8 }}>/100</span>
//         </div>
//         <div>
//           <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
//             Overall Skill Score
//           </div>
//           <div style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.5 }}>
//             You are above average in Programming and Verbal, but System Design and Computer
//             Networks need focused attention before your Google interview.
//           </div>
//         </div>
//       </div>

//       {/* Skills by category */}
//       {categories.map(cat => {
//         const catSkills = skills.filter(s => s.category === cat)
//         return (
//           <div
//             key={cat}
//             style={{
//               background: 'var(--card)',
//               border: '1px solid var(--border)',
//               borderRadius: 20,
//               padding: '24px',
//               marginBottom: 20,
//             }}
//           >
//             <div
//               style={{
//                 fontFamily: 'Outfit, sans-serif',
//                 fontSize: 16,
//                 fontWeight: 700,
//                 marginBottom: 20,
//                 color: 'var(--foreground)',
//               }}
//             >
//               {cat}
//             </div>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//               {catSkills.map(skill => {
//                 const { label, color, bg } = scoreLabel(skill.score)
//                 return (
//                   <div key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//                     <div style={{ width: 120, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
//                       {skill.name}
//                     </div>
//                     <div style={{ flex: 1, height: 8, background: 'var(--muted)', borderRadius: 100, overflow: 'hidden' }}>
//                       <div
//                         style={{
//                           height: '100%',
//                           width: `${skill.score}%`,
//                           background: skill.color,
//                           borderRadius: 100,
//                           transition: 'width 0.8s ease',
//                         }}
//                       />
//                     </div>
//                     <div
//                       style={{
//                         width: 36,
//                         textAlign: 'right',
//                         fontSize: 14,
//                         fontWeight: 700,
//                         color: skill.color,
//                         flexShrink: 0,
//                       }}
//                     >
//                       {skill.score}
//                     </div>
//                     <div
//                       style={{
//                         padding: '3px 10px',
//                         borderRadius: 100,
//                         background: bg,
//                         color,
//                         fontSize: 11,
//                         fontWeight: 700,
//                         flexShrink: 0,
//                         minWidth: 90,
//                         textAlign: 'center',
//                       }}
//                     >
//                       {label}
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         )
//       })}

//       {/* Gaps to focus */}
//       <div
//         style={{
//           background: '#FFFBEB',
//           border: '1px solid #FDE68A',
//           borderRadius: 20,
//           padding: '24px',
//         }}
//       >
//         <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: '#92400E', marginBottom: 16 }}>
//           ⚠️ Priority Skill Gaps
//         </div>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
//           {skills
//             .filter(s => s.score < 60)
//             .sort((a, b) => a.score - b.score)
//             .map(skill => (
//               <div
//                 key={skill.name}
//                 style={{
//                   padding: '12px 14px',
//                   borderRadius: 12,
//                   background: '#fff',
//                   border: '1px solid #FDE68A',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                 }}
//               >
//                 <span style={{ fontSize: 14, fontWeight: 600 }}>{skill.name}</span>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{skill.score}/100</span>
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   )
// }
