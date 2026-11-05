
import { useNavigate } from 'react-router'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import { apiRequest } from '../api/api'

type ProgressData = {
  user_id: number
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_percentage: number
}

type RoadmapTask = {
  id: number
  title: string
  description: string
  category: string
  estimated_hours: number
  day_number: number
  is_completed: boolean
}

type RoadmapData = {
  id: number
  title: string
  description: string
  tasks: RoadmapTask[]
}

type SkillAnalysisData = {
  dsa: number
  development: number
  aptitude: number
  resume: number
  interview: number
  career_readiness_score: number
  level: string
}

type ResumeData = {
  ats_score: number
}

type EmployabilityData = {
  employability_score: number | null
  skill_score: number | null
  resume_ats_score: number | null
  roadmap_progress: number | null
  available_components: number
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const { profile } = useUser()

  const [progressData, setProgressData] =
    useState<ProgressData | null>(null)

  const [progressLoading, setProgressLoading] =
    useState(true)

  const [progressError, setProgressError] =
    useState('')

  const [skillData, setSkillData] =
    useState<SkillAnalysisData | null>(null)

  const [skillLoading, setSkillLoading] =
    useState(true)

  const [skillError, setSkillError] =
    useState('')
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [resumeLoading, setResumeLoading] = useState(true)

  const [employabilityData, setEmployabilityData] =
    useState<EmployabilityData | null>(null)

  const [employabilityLoading, setEmployabilityLoading] =
    useState(true)

  const [roadmapTasks, setRoadmapTasks] =
    useState<RoadmapTask[]>([])

  const [roadmapLoading, setRoadmapLoading] =
    useState(true)

  const [roadmapError, setRoadmapError] =
    useState('')

  const [updatingTaskId, setUpdatingTaskId] =
    useState<number | null>(null)

  const [taskActionError, setTaskActionError] =
    useState('')

  const firstName = profile.name
    ? profile.name.split(' ')[0]
    : 'there'

  // Load progress summary from the backend.
  const loadProgress = async () => {
    try {
      const data = await apiRequest('/progress')

      setProgressData(data as ProgressData)
      setProgressError('')
    } catch (error) {
      console.error('Failed to load progress:', error)

      setProgressError(
        error instanceof Error
          ? error.message
          : 'Could not load progress.'
      )
    } finally {
      setProgressLoading(false)
    }
  }
  
  const loadSkillAnalysis = async () => {
    try {
      setSkillLoading(true)

      const data = await apiRequest('/skills/latest')

      setSkillData(data as SkillAnalysisData)
      setSkillError('')
    } catch (error) {
      console.error(
        'Failed to load skill analysis:',
        error
      )

      // A user may not have analyzed their skills yet.
      setSkillData(null)

      setSkillError(
        error instanceof Error
          ? error.message
          : 'Could not load skill analysis.'
      )
    } finally {
      setSkillLoading(false)
    }
  }

  const loadResumeScore = async () => {
    try {
      setResumeLoading(true)

      const data = await apiRequest('/resume/latest')
      setResumeData(data as ResumeData)
    } catch (error) {
      console.error('Failed to load resume ATS score:', error)
      setResumeData(null)
    } finally {
      setResumeLoading(false)
    }
  }

  const loadEmployabilityScore = async () => {
    try {
      setEmployabilityLoading(true)

      const data = await apiRequest('/progress/employability')

      setEmployabilityData(data as EmployabilityData)
    } catch (error) {
      console.error(
        'Failed to load employability score:',
        error
      )

      setEmployabilityData(null)
    } finally {
      setEmployabilityLoading(false)
    }
  }
  
  // Load the current user's roadmap.
  const loadRoadmap = async () => {
    try {
      const data = await apiRequest('/roadmap')
      const roadmap = data as RoadmapData

      setRoadmapTasks(
        Array.isArray(roadmap.tasks)
          ? [...roadmap.tasks].sort(
              (a, b) => a.day_number - b.day_number
            )
          : []
      )

      setRoadmapError('')
    } catch (error) {
      console.error('Failed to load roadmap:', error)

      setRoadmapError(
        error instanceof Error
          ? error.message
          : 'Failed to load roadmap.'
      )
    } finally {
      setRoadmapLoading(false)
    }
  }

  useEffect(() => {
    void loadProgress()
    void loadRoadmap()
    void loadSkillAnalysis()
    void loadResumeScore()
    void loadEmployabilityScore()
  }, [])

  // Complete or undo a task in the backend.
  const toggleTask = async (task: RoadmapTask) => {
    if (updatingTaskId !== null) return

    setUpdatingTaskId(task.id)
    setTaskActionError('')

    try {
      const endpoint = task.is_completed
        ? `/progress/task/${task.id}/uncomplete`
        : `/progress/task/${task.id}/complete`

      await apiRequest(endpoint, {
        method: 'POST',
      })

      // Refresh both sections so the UI shows saved backend data.
      await Promise.all([
        loadProgress(),
        loadRoadmap(),
        loadEmployabilityScore(),
      ])
    } catch (error) {
      console.error('Failed to update task:', error)

      setTaskActionError(
        error instanceof Error
          ? error.message
          : 'Could not update this task.'
      )
    } finally {
      setUpdatingTaskId(null)
    }
  }

  // const score = 72
  // const score = progressData?.completion_percentage ?? 0
  // const score = skillData?.career_readiness_score ?? 0
  const score = employabilityData?.employability_score ?? 0
  const circumference = 2 * Math.PI * 44
  const strokeDashoffset =
    circumference - (score / 100) * circumference

  const progressStats = [
    {
      label: 'Tasks Completed',
      val: progressData?.completed_tasks ?? 0,
      total: progressData?.total_tasks ?? 0,
      color: '#2563EB',
    },
    {
      label: 'Overall Progress',
      val: progressData?.completion_percentage ?? 0,
      total: 100,
      color: '#1D4ED8',
      suffix: '%',
    },
    {
      label: 'Pending Tasks',
      val: progressData?.pending_tasks ?? 0,
      total: progressData?.total_tasks ?? 0,
      color: '#059669',
    },
  ]

  return (
    <div>
      {/* Welcome row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'start',
          gap: 24,
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              marginBottom: 4,
            }}
          >
            Hi, {firstName} 👋
          </h1>

          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 14,
            }}
          >
            Keep building. Your future is loading...
          </p>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #EFF6FF, #EFF6FF)',
            border: '1px solid #BFDBFE',
            fontSize: 13,
            color: 'var(--primary)',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            {progressLoading
              ? '...'
              : `${progressData?.pending_tasks ?? 0} tasks`}
          </div>

          <div style={{ opacity: 0.7 }}>
            remaining
          </div>
        </div>
      </div>

      {/* Dashboard cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Employability & Resume ATS Score Card */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Employability Score */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--muted-foreground)',
              marginBottom: 16,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Employability Score
          </div>

          {/* Circular Score */}
          <div
            style={{
              position: 'relative',
              width: 100,
              height: 100,
            }}
          >
            <svg
              width="100"
              height="100"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="var(--border)"
                strokeWidth="8"
              />

              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />

              <defs>
                <linearGradient
                  id="scoreGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
            </svg>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--primary)',
                  lineHeight: 1,
                }}
              >
                {employabilityLoading
                  ? '...'
                  : employabilityData?.employability_score != null
                    ? Math.round(score)
                    : '--'}
              </span>

              <span
                style={{
                  fontSize: 10,
                  color: 'var(--muted-foreground)',
                }}
              >
                /100
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '6px 12px',
              borderRadius: 8,
              background: '#ECFDF5',
              color: '#059669',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {employabilityLoading
              ? 'Calculating score...'
              : employabilityData?.employability_score != null
                ? `${employabilityData.available_components}/3 components included`
                : 'Complete your assessments to see your score'}
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'var(--border)',
              margin: '24px 0',
            }}
          />

          {/* Resume ATS Score */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted-foreground)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Resume ATS Score
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted-foreground)',
                }}
              >
                Latest resume compatibility
              </div>
            </div>

            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--primary)',
              }}
            >
              {resumeLoading
                ? '...'
                : resumeData
                  ? `${Math.round(resumeData.ats_score)}%`
                  : '--'}
            </div>
          </div>
        </div>
        
        {/* Skill Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Skill Breakdown
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your latest assessment scores across key placement skills.
            </p>
          </div>

          {skillLoading ? (
            <p className="text-sm text-gray-500">Loading skill scores...</p>
          ) : skillData ? (
            <div className="space-y-5">
              {([
                ["DSA", skillData.dsa],
                ["Development", skillData.development],
                ["Aptitude", skillData.aptitude],
                ["Resume", skillData.resume],
                ["Interview", skillData.interview],
              ] as [string, number][]).map(([name, value]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {value}/100
                    </span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${Math.max(0, Math.min(100, value))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Complete your skill assessment to see your breakdown.
            </p>
          )}
        </div>

        {/* Backend progress statistics */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--muted-foreground)',
              marginBottom: 16,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Progress Overview
          </div>

          {progressLoading && (
            <p style={{ fontSize: 12 }}>
              Loading your progress...
            </p>
          )}

          {progressError && (
            <p style={{ fontSize: 12, color: '#F87171' }}>
              {progressError}
            </p>
          )}

          {!progressLoading &&
            !progressError &&
            progressStats.map((stat) => {
              const percentage =
                stat.total > 0
                  ? Math.min(
                      100,
                      Math.max(0, (stat.val / stat.total) * 100)
                    )
                  : 0

              return (
                <div
                  key={stat.label}
                  style={{ marginBottom: 18 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--foreground)',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: stat.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {stat.val}
                      {stat.suffix || ` / ${stat.total}`}
                    </span>
                  </div>

                  <div
                    style={{
                      height: 6,
                      background: 'var(--muted)',
                      borderRadius: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: stat.color,
                        borderRadius: 100,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Today's Plan - real roadmap tasks */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              Your Roadmap Tasks
            </h2>

            <div
              style={{
                fontSize: 12,
                color: 'var(--muted-foreground)',
              }}
            >
              Tasks are loaded from your saved roadmap.
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/roadmap')}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Full Roadmap →
          </button>
        </div>

        {roadmapLoading && (
          <p style={{ color: 'var(--muted-foreground)' }}>
            Loading roadmap tasks...
          </p>
        )}

        {roadmapError && (
          <div style={{ color: '#F87171', marginBottom: 12 }}>
            {roadmapError}
            <button
              onClick={() => {
                setRoadmapLoading(true)
                void loadRoadmap()
              }}
              style={{ marginLeft: 10, cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        )}

        {taskActionError && (
          <p style={{ color: '#F87171', fontSize: 13 }}>
            {taskActionError}
          </p>
        )}

        {!roadmapLoading &&
          !roadmapError &&
          roadmapTasks.length === 0 && (
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: 'var(--background)',
              }}
            >
              <p>No roadmap tasks found yet.</p>
              <button
                onClick={() => navigate('/onboarding')}
                style={{
                  marginTop: 10,
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 8,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Create Your Roadmap
              </button>
            </div>
          )}

        {!roadmapLoading &&
          !roadmapError &&
          roadmapTasks.map((task) => {
            const done = task.is_completed
            const updating = updatingTaskId === task.id

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  marginBottom: 10,
                  borderRadius: 12,
                  background: done ? '#F0FDF4' : 'var(--background)',
                  border: `1px solid ${
                    done ? '#BBF7D0' : 'var(--border)'
                  }`,
                  opacity: updating ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: done ? '#DCFCE7' : 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {done ? '✅' : '📘'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: done ? '#15803D' : 'var(--foreground)',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    Day {task.day_number}: {task.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--muted-foreground)',
                      marginTop: 4,
                    }}
                  >
                    {task.description}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--muted-foreground)',
                      marginTop: 5,
                    }}
                  >
                    {task.category} · {task.estimated_hours} hours
                  </div>
                </div>

                <button
                  disabled={updating || updatingTaskId !== null}
                  onClick={() => void toggleTask(task)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: done
                      ? '#DCFCE7'
                      : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: done ? '#15803D' : '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor:
                      updating || updatingTaskId !== null
                        ? 'wait'
                        : 'pointer',
                    minWidth: 92,
                  }}
                >
                  {updating
                    ? 'Saving...'
                    : done
                      ? 'Undo ✓'
                      : 'Mark Done'}
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}
                                                                                                                                                                    



// import { useNavigate } from 'react-router'
// import { useEffect, useState } from 'react'
// import { useUser } from '../context/UserContext'
// import { apiRequest } from '../api/api'

// const todayTasks = [
//   { icon: '💻', subject: 'DSA', topic: 'Arrays — Medium Problems', time: '2 Problems', status: 'start' },
//   { icon: '📚', subject: 'Core Subject', topic: 'OS — Process Scheduling', time: '1.5 Hours', status: 'continue' },
//   { icon: '🧮', subject: 'Aptitude', topic: 'Quantitative — Time & Work', time: '20 Questions', status: 'start' },
//   { icon: '🛠️', subject: 'Project', topic: 'Portfolio Website — React setup', time: '1 Hour', status: 'continue' },
//   { icon: '📝', subject: 'Mock Test', topic: 'Aptitude Mock Test #4', time: '45 Min', status: 'start' },
// ]

// // const progressStats = [
// //   { label: 'Tasks Completed', val: 12, total: 18, color: '#2563EB' },
// //   { label: 'Weekly Progress', val: 68, total: 100, color: '#1D4ED8', suffix: '%' },
// //   { label: 'DSA Problems', val: 87, total: 150, color: '#059669' },
// // ]

// export default function DashboardHome() {
//   const navigate = useNavigate()
//   const { profile } = useUser()
//   type ProgressData = {
//     id: number
//     title: string
//     description: string
//     category: string
//     estimated_hours: number
//     day_number: number
//     is_completed: boolean
//   }

//   const [progressData, setProgressData] = useState<ProgressData | null>(null)
//   const [progressLoading, setProgressLoading] = useState(true)
//   const [progressError, setProgressError] = useState('')
//   const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([])
//   const [roadmapLoading, setRoadmapLoading] = useState(true)
//   const [roadmapError, setRoadmapError] = useState('')

//   useEffect(() => {
//     apiRequest('/progress')
//       .then((data: ProgressData) => {
//         setProgressData(data)
//         setProgressError('')
//       })
//       .catch((error: Error) => {
//         console.error('Failed to load progress:', error)
//         setProgressError(error.message || 'Could not load progress')
//       })
//       .finally(() => {
//         setProgressLoading(false)
//       })
//   }, [])

//   const loadRoadmap = async () => {
//     try {
//       const data = await apiRequest('/roadmap')
//       setRoadmapTasks(data.tasks ?? [])
//       setRoadmapError('')
//     } catch (error) {
//       console.error('Failed to load roadmap:', error)
//       setRoadmapError(
//         error instanceof Error ? error.message : 'Failed to load roadmap'
//       )
//     } finally {
//       setRoadmapLoading(false)
//     }
//   }
//   useEffect(() => {
//     loadRoadmap()
//   }, [])

//   const [completedTasks, setCompletedTasks] = useState<number[]>([])
//   const firstName = profile.name ? profile.name.split(' ')[0] : 'there'
//   const progressStats = [
//     {
//       label: 'Tasks Completed',
//       val: progressData?.completed_tasks ?? 0,
//       total: progressData?.total_tasks ?? 0,
//       color: '#2563EB',
//     },
//     {
//       label: 'Overall Progress',
//       val: progressData?.completion_percentage ?? 0,
//       total: 100,
//       color: '#1D4ED8',
//       suffix: '%',
//     },
//     {
//       label: 'Pending Tasks',
//       val: progressData?.pending_tasks ?? 0,
//       total: progressData?.total_tasks ?? 0,
//       color: '#059669',
//     },
//   ]

//   const score = 72

//   const circumference = 2 * Math.PI * 44
//   const strokeDashoffset = circumference - (score / 100) * circumference

//   return (
//     <div>
//       {/* Welcome row */}
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr auto',
//           alignItems: 'start',
//           gap: 24,
//           marginBottom: 28,
//         }}
//       >
//         <div>
//           <h1
//             style={{
//               fontFamily: 'Outfit, sans-serif',
//               fontSize: 28,
//               fontWeight: 800,
//               letterSpacing: '-0.5px',
//               marginBottom: 4,
//             }}
//           >
//             Hi, {firstName} 👋
//           </h1>
//           <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
//             Keep building. Your future is loading... — Thursday, 7 Aug 2026
//           </p>
//         </div>
//         <div
//           style={{
//             padding: '8px 16px',
//             borderRadius: 12,
//             background: 'linear-gradient(135deg, #EFF6FF, #EFF6FF)',
//             border: '1px solid #BFDBFE',
//             fontSize: 13,
//             color: 'var(--primary)',
//             fontWeight: 600,
//             textAlign: 'center',
//           }}
//         >
//           <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15 }}>9 months</div>
//           <div style={{ opacity: 0.7 }}>to placement</div>
//         </div>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
//         {/* Employability Score */}
//         <div
//           style={{
//             background: 'var(--card)',
//             border: '1px solid var(--border)',
//             borderRadius: 20,
//             padding: '24px',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gridRow: 'span 1',
//           }}
//         >
//           <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
//             Employability Score
//           </div>
//           <div style={{ position: 'relative', width: 100, height: 100 }}>
//             <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
//               <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
//               <circle
//                 cx="50"
//                 cy="50"
//                 r="44"
//                 fill="none"
//                 stroke="url(#scoreGrad)"
//                 strokeWidth="8"
//                 strokeLinecap="round"
//                 strokeDasharray={circumference}
//                 strokeDashoffset={strokeDashoffset}
//                 style={{ transition: 'stroke-dashoffset 1s ease' }}
//               />
//               <defs>
//                 <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
//                   <stop offset="0%" stopColor="#2563EB" />
//                   <stop offset="100%" stopColor="#1D4ED8" />
//                 </linearGradient>
//               </defs>
//             </svg>
//             <div
//               style={{
//                 position: 'absolute',
//                 inset: 0,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <span
//                 style={{
//                   fontFamily: 'Outfit, sans-serif',
//                   fontSize: 26,
//                   fontWeight: 800,
//                   color: 'var(--primary)',
//                   lineHeight: 1,
//                 }}
//               >
//                 {score}
//               </span>
//               <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>/100</span>
//             </div>
//           </div>
//           <div
//             style={{
//               marginTop: 14,
//               padding: '6px 12px',
//               borderRadius: 8,
//               background: '#ECFDF5',
//               color: '#059669',
//               fontSize: 12,
//               fontWeight: 600,
//             }}
//           >
//             ✓ Top 28% of students
//           </div>
//         </div>

//         {/* Progress stats */}
//         <div
//           style={{
//             background: 'var(--card)',
//             border: '1px solid var(--border)',
//             borderRadius: 20,
//             padding: '24px',
//           }}
//         >
//           <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
//             Progress Overview
//           </div>
//           {progressLoading && (
//             <p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
//               Loading your progress...
//             </p>
//           )}

//           {progressError && (
//             <p style={{ fontSize: 12, color: '#F87171' }}>
//               {progressError}
//             </p>
//           )}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//             {progressStats.map(stat => (
//               <div key={stat.label}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
//                   <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{stat.label}</span>
//                   <span style={{ fontSize: 13, fontWeight: 700, color: stat.color }}>
//                     {stat.val}{stat.suffix || ''} {!stat.suffix && `/ ${stat.total}`}
//                   </span>
//                 </div>
//                 <div style={{ height: 6, background: 'var(--muted)', borderRadius: 100, overflow: 'hidden' }}>
//                   <div
//                     style={{
//                       height: '100%',
//                       // width: `${(stat.val / stat.total) * 100}%`,
//                       width: `${stat.total > 0
//                         ? Math.min(100, (stat.val / stat.total) * 100)
//                         : 0}%`,
//                       background: stat.color,
//                       borderRadius: 100,
//                     }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Quick actions */}
//         <div
//           style={{
//             background: 'var(--card)',
//             border: '1px solid var(--border)',
//             borderRadius: 20,
//             padding: '24px',
//           }}
//         >
//           <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', marginBottom: 16, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
//             Quick Actions
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//             {[
//               { label: 'View Full Roadmap', icon: '🗺️', path: '/dashboard/roadmap', color: '#EFF6FF', textColor: '#2563EB' },
//               { label: 'Update Resume', icon: '📄', path: '/dashboard/resume', color: '#ECFDF5', textColor: '#059669' },
//               { label: 'Check Skills', icon: '📊', path: '/dashboard/skills', color: '#FFF7ED', textColor: '#EA580C' },
//               { label: 'Get Courses', icon: '🎯', path: '/dashboard/recommendations', color: '#EFF6FF', textColor: '#1D4ED8' },
//             ].map(a => (
//               <button
//                 key={a.label}
//                 onClick={() => navigate(a.path)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 10,
//                   padding: '10px 12px',
//                   borderRadius: 10,
//                   border: 'none',
//                   background: a.color,
//                   color: a.textColor,
//                   fontSize: 13,
//                   fontWeight: 600,
//                   cursor: 'pointer',
//                   textAlign: 'left',
//                   fontFamily: 'Inter, sans-serif',
//                 }}
//               >
//                 <span>{a.icon}</span>
//                 <span>{a.label}</span>
//                 <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Today's Plan */}
//       <div
//         style={{
//           background: 'var(--card)',
//           border: '1px solid var(--border)',
//           borderRadius: 20,
//           padding: '24px 28px',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
//           <div>
//             <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 2 }}>
//               Today&apos;s Plan
//             </h2>
//             <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Thursday, 7 August 2026</div>
//           </div>
//           <button
//             onClick={() => navigate('/dashboard/roadmap')}
//             style={{
//               padding: '7px 14px',
//               borderRadius: 8,
//               border: '1px solid var(--border)',
//               background: 'transparent',
//               color: 'var(--primary)',
//               fontSize: 13,
//               fontWeight: 600,
//               cursor: 'pointer',
//               fontFamily: 'Inter, sans-serif',
//             }}
//           >
//             View Full Plan →
//           </button>
//         </div>

//         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//           {todayTasks.map((task, i) => {
//             const done = completedTasks.includes(i)
//             return (
//               <div
//                 key={i}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 16,
//                   padding: '14px 16px',
//                   borderRadius: 12,
//                   background: done ? '#F0FDF4' : 'var(--background)',
//                   border: `1px solid ${done ? '#BBF7D0' : 'var(--border)'}`,
//                   transition: 'all 0.2s',
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 10,
//                     background: done ? '#DCFCE7' : 'var(--secondary)',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     fontSize: 18,
//                     flexShrink: 0,
//                   }}
//                 >
//                   {done ? '✅' : task.icon}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600, fontSize: 14, color: done ? '#15803D' : 'var(--foreground)', textDecoration: done ? 'line-through' : 'none' }}>
//                     {task.subject}
//                   </div>
//                   <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{task.topic}</div>
//                 </div>
//                 <div style={{ fontSize: 12, color: 'var(--muted-foreground)', minWidth: 80, textAlign: 'right' }}>
//                   {task.time}
//                 </div>
//                 <button
//                   onClick={() =>
//                     setCompletedTasks(prev =>
//                       prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i],
//                     )
//                   }
//                   style={{
//                     padding: '6px 16px',
//                     borderRadius: 8,
//                     border: 'none',
//                     background: done ? '#DCFCE7' : task.status === 'continue' ? '#EFF6FF' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
//                     color: done ? '#15803D' : task.status === 'continue' ? 'var(--primary)' : '#fff',
//                     fontSize: 12,
//                     fontWeight: 700,
//                     cursor: 'pointer',
//                     fontFamily: 'Inter, sans-serif',
//                     minWidth: 80,
//                     textAlign: 'center',
//                   }}
//                 >
//                   {done ? 'Done ✓' : task.status === 'continue' ? 'Continue' : 'Start'}
//                 </button>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </div>

    
//   )
  
// }

