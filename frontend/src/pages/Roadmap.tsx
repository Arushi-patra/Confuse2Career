import { useEffect, useState } from "react"
import { apiRequest } from "../api/api"

interface RoadmapTask {
  id: number
  title: string
  description: string
  category: string
  estimated_hours: number
  day_number: number
  is_completed: boolean
}

interface RoadmapData {
  id: number
  title: string
  description: string
  tasks: RoadmapTask[]
}

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingTask, setUpdatingTask] = useState<number | null>(null)

  const loadRoadmap = async () => {
    try {
      const data = await apiRequest("/roadmap") as RoadmapData

      setRoadmap({
        ...data,
        tasks: [...data.tasks].sort(
          (a, b) => a.day_number - b.day_number
        )
      })

      setError("")
    } catch (err) {
      setRoadmap(null)

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your roadmap."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRoadmap()
  }, [])

  const toggleTask = async (task: RoadmapTask) => {
    if (updatingTask !== null) return

    setUpdatingTask(task.id)

    try {
      const endpoint = task.is_completed
        ? `/progress/task/${task.id}/uncomplete`
        : `/progress/task/${task.id}/complete`

      await apiRequest(endpoint, {
        method: "POST"
      })

      await loadRoadmap()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update task."
      )
    } finally {
      setUpdatingTask(null)
    }
  }

  if (loading) {
    return <div style={{ padding: 30 }}>Loading your roadmap...</div>
  }

  if (!roadmap) {
    return (
      <div style={{
        padding: 30,
        background: "var(--card)",
        borderRadius: 16
      }}>
        <h2>Your roadmap is not available yet.</h2>

        <p style={{ color: "var(--muted-foreground)" }}>
          {error || "Complete onboarding to generate your personalized roadmap."}
        </p>

        <button
          onClick={() => window.location.assign("/onboarding")}
          style={buttonStyle}
        >
          Create My Roadmap
        </button>
      </div>
    )
  }

  const completed = roadmap.tasks.filter(
    task => task.is_completed
  ).length

  const total = roadmap.tasks.length

  const percentage = total
    ? Math.round((completed / total) * 100)
    : 0

  const groupedTasks = roadmap.tasks.reduce<Record<string, RoadmapTask[]>>(
    (groups, task) => {
      const category = task.category || "Other"

      if (!groups[category]) {
        groups[category] = []
      }

      groups[category].push(task)

      return groups
    },
    {}
  )

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 27,
          fontWeight: 800
        }}>
          Your Learning Roadmap 🗺️
        </h1>

        <p style={{
          color: "var(--muted-foreground)",
          fontSize: 14
        }}>
          {roadmap.description}
        </p>
      </div>

      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: 22,
        marginBottom: 25
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12
        }}>
          <strong>Overall Roadmap Progress</strong>
          <strong>{percentage}%</strong>
        </div>

        <div style={{
          height: 9,
          background: "var(--border)",
          borderRadius: 20,
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${percentage}%`,
            background: "#2563EB",
            borderRadius: 20,
            transition: "width 0.3s"
          }} />
        </div>

        <p style={{
          fontSize: 13,
          color: "var(--muted-foreground)",
          marginTop: 12
        }}>
          {completed} of {total} tasks completed
        </p>
      </div>

      {error && (
        <p style={{ color: "#DC2626", marginBottom: 15 }}>
          {error}
        </p>
      )}

      {Object.entries(groupedTasks).map(([category, tasks]) => {
        const categoryCompleted = tasks.filter(
          task => task.is_completed
        ).length

        return (
          <section key={category} style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 22,
            marginBottom: 18
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 15
            }}>
              <h2 style={{
                fontSize: 17,
                fontWeight: 750
              }}>
                {category}
              </h2>

              <span style={{
                color: "var(--muted-foreground)",
                fontSize: 13
              }}>
                {categoryCompleted}/{tasks.length} completed
              </span>
            </div>

            {tasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "15px 0",
                  borderTop: "1px solid var(--border)"
                }}
              >
                <button
                  disabled={updatingTask === task.id}
                  onClick={() => void toggleTask(task)}
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 7,
                    border: "2px solid #2563EB",
                    background: task.is_completed
                      ? "#2563EB"
                      : "transparent",
                    color: "white",
                    cursor: "pointer",
                    flexShrink: 0
                  }}
                >
                  {task.is_completed ? "✓" : ""}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 650,
                    fontSize: 14,
                    textDecoration: task.is_completed
                      ? "line-through"
                      : "none",
                    color: task.is_completed
                      ? "var(--muted-foreground)"
                      : "var(--foreground)"
                  }}>
                    {task.title}
                  </div>

                  <p style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginTop: 5
                  }}>
                    {task.description}
                  </p>

                  <span style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)"
                  }}>
                    Day {task.day_number} · {task.estimated_hours} study hours
                  </span>
                </div>
              </div>
            ))}
          </section>
        )
      })}

      <button
        onClick={() => void loadRoadmap()}
        style={buttonStyle}
      >
        Refresh Roadmap
      </button>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: "12px 20px",
  background: "#2563EB",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer"
}



// import { useState } from 'react'

// const phases = [
//   {
//     phase: 'Phase 1',
//     title: 'Foundation',
//     duration: 'Months 1–2',
//     color: '#2563EB',
//     bg: '#EFF6FF',
//     tasks: [
//       { title: 'Data Structures Basics', sub: 'Arrays, Strings, Linked Lists, Stacks, Queues', done: true, tag: 'DSA' },
//       { title: 'Programming Language Mastery', sub: 'Java / Python — OOP concepts, Collections', done: true, tag: 'Coding' },
//       { title: 'Operating Systems Fundamentals', sub: 'Processes, Threads, Memory Management', done: false, tag: 'Core' },
//       { title: 'Math & Aptitude Basics', sub: 'Percentages, Ratios, Time & Work, Number Systems', done: false, tag: 'Aptitude' },
//     ],
//   },
//   {
//     phase: 'Phase 2',
//     title: 'Core Building',
//     duration: 'Months 3–5',
//     color: '#1D4ED8',
//     bg: '#EFF6FF',
//     tasks: [
//       { title: 'Advanced DSA', sub: 'Trees, Graphs, Dynamic Programming, Heaps', done: false, tag: 'DSA' },
//       { title: 'DBMS & SQL', sub: 'Normalization, Transactions, Query Optimization', done: false, tag: 'Core' },
//       { title: 'Computer Networks', sub: 'OSI Model, TCP/IP, DNS, HTTP protocols', done: false, tag: 'Core' },
//       { title: 'LeetCode Practice', sub: 'Medium difficulty — 100 problems', done: false, tag: 'DSA' },
//     ],
//   },
//   {
//     phase: 'Phase 3',
//     title: 'Projects & Portfolio',
//     duration: 'Months 6–7',
//     color: '#059669',
//     bg: '#ECFDF5',
//     tasks: [
//       { title: 'Full-Stack Portfolio Project', sub: 'React + Node.js + MongoDB with deployment', done: false, tag: 'Project' },
//       { title: 'Open Source Contribution', sub: 'GitHub contributions, PR reviews', done: false, tag: 'Project' },
//       { title: 'System Design Basics', sub: 'Scalability, Load Balancing, Caching', done: false, tag: 'Design' },
//       { title: 'Certifications', sub: 'AWS Cloud / Google Data Analytics', done: false, tag: 'Cert' },
//     ],
//   },
//   {
//     phase: 'Phase 4',
//     title: 'Interview Prep',
//     duration: 'Months 8–9',
//     color: '#EA580C',
//     bg: '#FFF7ED',
//     tasks: [
//       { title: 'Mock Interviews', sub: 'Technical + HR rounds — 10 full mock sessions', done: false, tag: 'Interview' },
//       { title: 'Resume Optimization', sub: 'ATS optimization, action verbs, metrics', done: false, tag: 'Resume' },
//       { title: 'Company-Specific Prep', sub: 'Google interview patterns, past questions', done: false, tag: 'Company' },
//       { title: 'Behavioral Questions', sub: 'STAR method, leadership, conflict examples', done: false, tag: 'HR' },
//     ],
//   },
// ]

// const tagColors: Record<string, string> = {
//   DSA: '#2563EB',
//   Coding: '#1D4ED8',
//   Core: '#2563EB',
//   Aptitude: '#D97706',
//   Project: '#059669',
//   Design: '#0891B2',
//   Cert: '#DC2626',
//   Interview: '#EA580C',
//   Resume: '#2563EB',
//   Company: '#1D4ED8',
//   HR: '#059669',
// }

// export default function Roadmap() {
//   const [openPhase, setOpenPhase] = useState<number | null>(0)
//   const [doneTasks, setDoneTasks] = useState<Set<string>>(
//     new Set(['Phase 1-0', 'Phase 1-1']),
//   )

//   const toggleTask = (key: string) =>
//     setDoneTasks(prev => {
//       const next = new Set(prev)
//       next.has(key) ? next.delete(key) : next.add(key)
//       return next
//     })

//   return (
//     <div>
//       <div style={{ marginBottom: 28 }}>
//         <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
//           Your Learning Roadmap 🗺️
//         </h1>
//         <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
//           9-month personalized plan for Google SDE — click phases to expand tasks
//         </p>
//       </div>

//       {/* Timeline */}
//       <div style={{ display: 'flex', gap: 0, marginBottom: 32, overflowX: 'auto', padding: '0 0 4px' }}>
//         {phases.map((p, i) => (
//           <div key={i} style={{ flex: 1, minWidth: 120, position: 'relative' }}>
//             <div
//               style={{
//                 height: 6,
//                 background: i === 0 ? `linear-gradient(90deg, ${p.color}, ${phases[1]?.color || p.color})` : i < 2 ? p.color : 'var(--border)',
//                 marginBottom: 8,
//               }}
//             />
//             <div style={{ fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 2 }}>{p.phase}</div>
//             <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{p.title}</div>
//             <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{p.duration}</div>
//           </div>
//         ))}
//       </div>

//       {/* Phase cards */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//         {phases.map((phase, pi) => {
//           const isOpen = openPhase === pi
//           const completed = phase.tasks.filter((_, ti) => doneTasks.has(`${phase.phase}-${ti}`)).length
//           return (
//             <div
//               key={pi}
//               style={{
//                 background: 'var(--card)',
//                 border: `1px solid ${isOpen ? phase.color + '40' : 'var(--border)'}`,
//                 borderRadius: 20,
//                 overflow: 'hidden',
//                 transition: 'border-color 0.2s',
//               }}
//             >
//               {/* Phase header */}
//               <button
//                 onClick={() => setOpenPhase(isOpen ? null : pi)}
//                 style={{
//                   width: '100%',
//                   padding: '20px 24px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 16,
//                   background: isOpen ? phase.bg : 'transparent',
//                   border: 'none',
//                   cursor: 'pointer',
//                   textAlign: 'left',
//                   transition: 'background 0.2s',
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 10,
//                     background: phase.color,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     color: '#fff',
//                     fontWeight: 800,
//                     fontSize: 13,
//                     fontFamily: 'Outfit, sans-serif',
//                     flexShrink: 0,
//                   }}
//                 >
//                   P{pi + 1}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
//                     {phase.phase}: {phase.title}
//                   </div>
//                   <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{phase.duration}</div>
//                 </div>
//                 <div style={{ textAlign: 'right', flexShrink: 0 }}>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: phase.color }}>
//                     {completed}/{phase.tasks.length} done
//                   </div>
//                   <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
//                     {Math.round((completed / phase.tasks.length) * 100)}%
//                   </div>
//                 </div>
//                 <div style={{ fontSize: 18, color: 'var(--muted-foreground)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
//                   ▼
//                 </div>
//               </button>

//               {/* Phase tasks */}
//               {isOpen && (
//                 <div style={{ borderTop: `1px solid ${phase.color}20`, padding: '8px 24px 20px' }}>
//                   {phase.tasks.map((task, ti) => {
//                     const key = `${phase.phase}-${ti}`
//                     const isDone = doneTasks.has(key)
//                     return (
//                       <div
//                         key={ti}
//                         style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: 14,
//                           padding: '14px 0',
//                           borderBottom: ti < phase.tasks.length - 1 ? '1px solid var(--border)' : 'none',
//                         }}
//                       >
//                         <button
//                           onClick={() => toggleTask(key)}
//                           style={{
//                             width: 22,
//                             height: 22,
//                             borderRadius: 6,
//                             border: `2px solid ${isDone ? phase.color : 'var(--border)'}`,
//                             background: isDone ? phase.color : 'transparent',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             cursor: 'pointer',
//                             flexShrink: 0,
//                             color: '#fff',
//                             fontSize: 12,
//                           }}
//                         >
//                           {isDone ? '✓' : ''}
//                         </button>
//                         <div style={{ flex: 1 }}>
//                           <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: isDone ? 'line-through' : 'none' }}>
//                             {task.title}
//                           </div>
//                           <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{task.sub}</div>
//                         </div>
//                         <div
//                           style={{
//                             padding: '3px 10px',
//                             borderRadius: 100,
//                             background: (tagColors[task.tag] || '#2563EB') + '15',
//                             color: tagColors[task.tag] || '#2563EB',
//                             fontSize: 11,
//                             fontWeight: 700,
//                             flexShrink: 0,
//                           }}
//                         >
//                           {task.tag}
//                         </div>
//                       </div>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
