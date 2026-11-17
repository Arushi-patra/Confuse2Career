import { useEffect, useState } from "react"
import { apiRequest } from "../api/api"


// ==========================================
// TYPES
// ==========================================

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
  start_date?: string
  end_date?: string
  is_completed?: boolean
  tasks: RoadmapTask[]
}

interface EnrichedTask extends RoadmapTask {
  week_number: number
  priority: string
  resource_title: string
  resource_type: string
  resource_url: string
}

interface WeekGroup {
  week: number
  tasks: EnrichedTask[]
}


// ==========================================
// EXTRACT ML INFORMATION FROM DESCRIPTION
// ==========================================

function extractTaskDetails(task: RoadmapTask): EnrichedTask {

  const description = task.description || ""

  // Extract week number.
  const weekMatch = description.match(
    /Scheduled for Week\s+(\d+)/i
  )

  const weekNumber = weekMatch
    ? Number(weekMatch[1])
    : 1

  // Extract priority.
  const priorityMatch = description.match(
    /Priority:\s*(High|Medium|Low)/i
  )

  const priority = priorityMatch
    ? priorityMatch[1]
    : task.category?.replace(/\s*Priority/i, "") || "Medium"

  // Extract resource title.
  const resourceTitleMatch = description.match(
    /Recommended Resource:\s*(.*?)(?=\s+Resource Type:|\s+Resource URL:|\s+Recommendation Score:|$)/i
  )

  const resourceTitle = resourceTitleMatch
    ? resourceTitleMatch[1].trim()
    : ""

  // Extract resource type.
  const resourceTypeMatch = description.match(
    /Resource Type:\s*(.*?)(?=\s+Resource URL:|\s+Recommendation Score:|$)/i
  )

  const resourceType = resourceTypeMatch
    ? resourceTypeMatch[1].trim()
    : ""

  // Extract resource URL.
  const resourceUrlMatch = description.match(
    /Resource (?:URL|link):\s*(https?:\/\/\S+)/i
  )

  const resourceUrl = resourceUrlMatch
    ? resourceUrlMatch[1].replace(/[.,]+$/, "")
    : ""

  return {

    ...task,

    week_number: weekNumber,

    priority,

    resource_title: resourceTitle,

    resource_type: resourceType,

    resource_url: resourceUrl

  }
}


// ==========================================
// GROUP TASKS BY WEEK
// ==========================================

function groupTasksByWeek(tasks: EnrichedTask[]): WeekGroup[] {

  const groups: Record<number, EnrichedTask[]> = {}

  tasks.forEach(task => {

    const week = task.week_number

    if (!groups[week]) {
      groups[week] = []
    }

    groups[week].push(task)

  })

  return Object.entries(groups)

    .map(([week, tasks]) => ({

      week: Number(week),

      tasks: tasks.sort(
        (a, b) => a.day_number - b.day_number
      )

    }))

    .sort((a, b) => a.week - b.week)
}


// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Roadmap() {

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [updatingTask, setUpdatingTask] = useState<number | null>(null)


  // ========================================
  // LOAD ROADMAP FROM BACKEND
  // ========================================

  const loadRoadmap = async () => {

    try {

      const data = await apiRequest("/roadmap") as RoadmapData

      const sortedTasks = [...data.tasks].sort(
        (a, b) => a.day_number - b.day_number
      )

      setRoadmap({

        ...data,

        tasks: sortedTasks

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


  // ========================================
  // COMPLETE / UNCOMPLETE TASK
  // ========================================

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


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (

      <div style={containerStyle}>

        <h2>Loading your personalized roadmap...</h2>

      </div>

    )

  }


  // ========================================
  // NO ROADMAP
  // ========================================

  if (!roadmap) {

    return (

      <div style={containerStyle}>

        <div style={cardStyle}>

          <h2>Your roadmap is not available yet.</h2>

          <p style={mutedTextStyle}>

            {error || "Complete onboarding to generate your personalized roadmap."}

          </p>

          <button

            onClick={() => window.location.assign("/onboarding")}

            style={buttonStyle}

          >

            Create My Roadmap

          </button>

        </div>

      </div>

    )

  }


  // ========================================
  // PROCESS ML TASKS
  // ========================================

  const enrichedTasks = roadmap.tasks.map(
    extractTaskDetails
  )

  const weeks = groupTasksByWeek(enrichedTasks)


  // ========================================
  // OVERALL PROGRESS
  // ========================================

  const completed = enrichedTasks.filter(
    task => task.is_completed
  ).length

  const total = enrichedTasks.length

  const percentage = total

    ? Math.round((completed / total) * 100)

    : 0


  // ========================================
  // TOTAL STUDY HOURS
  // ========================================

  const totalHours = enrichedTasks.reduce(

    (sum, task) => sum + task.estimated_hours,

    0

  )


  // ========================================
  // UI
  // ========================================

  return (

    <div style={containerStyle}>


      {/* HEADER */}

      <div style={{ marginBottom: 28 }}>

        <h1 style={{

          fontFamily: "Outfit, sans-serif",

          fontSize: 28,

          fontWeight: 800,

          color: "var(--foreground)"

        }}>

          Your AI Learning Roadmap 🗺️

        </h1>


        <h3 style={{

          marginTop: 10,

          fontSize: 18,

          color: "var(--primary)"

        }}>

          {roadmap.title}

        </h3>


        <p style={mutedTextStyle}>

          {roadmap.description}

        </p>


        <p style={{

          fontSize: 13,

          color: "var(--muted-foreground)",

          marginTop: 8

        }}>

          Your roadmap is generated using personalized ML recommendations.

        </p>

      </div>



      {/* SUMMARY CARDS */}

      <div style={{

        display: "grid",

        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",

        gap: 15,

        marginBottom: 25

      }}>


        <div style={summaryCardStyle}>

          <h2>{total}</h2>

          <p>Total Tasks</p>

        </div>


        <div style={summaryCardStyle}>

          <h2>{completed}</h2>

          <p>Completed Tasks</p>

        </div>


        <div style={summaryCardStyle}>

          <h2>{weeks.length}</h2>

          <p>Learning Weeks</p>

        </div>


        <div style={summaryCardStyle}>

          <h2>{totalHours.toFixed(1)}</h2>

          <p>Total Study Hours</p>

        </div>


      </div>



      {/* OVERALL PROGRESS */}

      <div style={cardStyle}>

        <div style={{

          display: "flex",

          justifyContent: "space-between",

          marginBottom: 12

        }}>

          <strong>Overall Roadmap Progress</strong>

          <strong style={{ color: "var(--primary)" }}>

            {percentage}%

          </strong>

        </div>


        <div style={progressBackgroundStyle}>

          <div style={{

            ...progressFillStyle,

            width: `${percentage}%`

          }} />

        </div>


        <p style={mutedTextStyle}>

          {completed} of {total} tasks completed

        </p>

      </div>



      {/* ERROR */}

      {error && (

        <p style={{

          color: "#DC2626",

          marginBottom: 15

        }}>

          {error}

        </p>

      )}



      {/* WEEKLY ROADMAP */}

      <div style={{ marginTop: 30 }}>

        <h2 style={{

          fontSize: 21,

          fontWeight: 800,

          marginBottom: 20

        }}>

          Your Weekly Learning Plan

        </h2>


        {weeks.map(week => {


          const weekCompleted = week.tasks.filter(

            task => task.is_completed

          ).length


          const weekTotal = week.tasks.length


          const weekPercentage = weekTotal

            ? Math.round((weekCompleted / weekTotal) * 100)

            : 0


          return (

            <section

              key={week.week}

              style={{

                ...cardStyle,

                marginBottom: 22

              }}

            >


              {/* WEEK HEADER */}

              <div style={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                flexWrap: "wrap",

                gap: 10,

                marginBottom: 15

              }}>


                <div>

                  <h2 style={{

                    fontSize: 19,

                    fontWeight: 800,

                    color: "var(--primary)"

                  }}>

                    Week {week.week}

                  </h2>


                  <p style={mutedTextStyle}>

                    {weekTotal} learning tasks

                  </p>

                </div>


                <span style={{

                  fontSize: 13,

                  fontWeight: 700

                }}>

                  {weekCompleted}/{weekTotal} completed

                </span>

              </div>



              {/* WEEK PROGRESS */}

              <div style={progressBackgroundStyle}>

                <div style={{

                  ...progressFillStyle,

                  width: `${weekPercentage}%`

                }} />

              </div>



              {/* TASKS */}

              {week.tasks.map(task => (

                <div

                  key={task.id}

                  style={{

                    padding: "18px 0",

                    borderTop: "1px solid var(--border)",

                    display: "flex",

                    gap: 14,

                    alignItems: "flex-start"

                  }}

                >


                  {/* COMPLETION BUTTON */}

                  <button

                    disabled={updatingTask === task.id}

                    onClick={() => void toggleTask(task)}

                    aria-label={

                      task.is_completed

                        ? "Mark task incomplete"

                        : "Mark task complete"

                    }

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



                  {/* TASK INFORMATION */}

                  <div style={{ flex: 1, minWidth: 0 }}>


                    <div style={{

                      display: "flex",

                      alignItems: "center",

                      flexWrap: "wrap",

                      gap: 9

                    }}>


                      <h3 style={{

                        fontSize: 15,

                        fontWeight: 750,

                        textDecoration: task.is_completed

                          ? "line-through"

                          : "none",

                        color: task.is_completed

                          ? "var(--muted-foreground)"

                          : "var(--foreground)"

                      }}>

                        {task.title}

                      </h3>


                      {/* PRIORITY BADGE */}

                      <span style={getPriorityStyle(task.priority)}>

                        {task.priority} Priority

                      </span>


                    </div>



                    {/* DESCRIPTION */}

                    <p style={{

                      fontSize: 13,

                      color: "var(--muted-foreground)",

                      marginTop: 7,

                      lineHeight: 1.6

                    }}>

                      {task.description.split(" Recommended Resource:")[0]}

                    </p>



                    {/* STUDY HOURS */}

                    <p style={{

                      fontSize: 12,

                      color: "var(--muted-foreground)",

                      marginTop: 8

                    }}>

                      📚 Day {task.day_number}

                      {" · "}

                      ⏱️ {task.estimated_hours} study hours

                    </p>



                    {/* RECOMMENDED RESOURCE */}

                    {task.resource_title && (

                      <div style={{

                        marginTop: 14,

                        padding: 14,

                        background: "var(--muted)",

                        borderRadius: 12,

                        border: "1px solid var(--border)"

                      }}>


                        <p style={{

                          fontSize: 11,

                          fontWeight: 800,

                          color: "var(--primary)",

                          marginBottom: 7

                        }}>

                          ✨ ML RECOMMENDED RESOURCE

                        </p>


                        <h4 style={{

                          fontSize: 14,

                          fontWeight: 700,

                          marginBottom: 8

                        }}>

                          {task.resource_title}

                        </h4>


                        {task.resource_type && (

                          <span style={{

                            fontSize: 11,

                            padding: "4px 9px",

                            borderRadius: 20,

                            background: "var(--background)",

                            color: "var(--muted-foreground)"

                          }}>

                            {task.resource_type.toUpperCase()}

                          </span>

                        )}


                        {task.resource_url && (

                          <div style={{ marginTop: 12 }}>

                            <a

                              href={task.resource_url}

                              target="_blank"

                              rel="noopener noreferrer"

                              style={resourceButtonStyle}

                            >

                              Open Resource ↗

                            </a>

                          </div>

                        )}

                      </div>

                    )}


                  </div>

                </div>

              ))}


            </section>

          )

        })}

      </div>



      {/* REFRESH */}

      <button

        onClick={() => void loadRoadmap()}

        style={buttonStyle}

      >

        ↻ Refresh Roadmap

      </button>


    </div>

  )

}



// ==========================================
// STYLES
// ==========================================

const containerStyle: React.CSSProperties = {

  padding: 25,

  width: "100%",

  boxSizing: "border-box"

}


const cardStyle: React.CSSProperties = {

  background: "var(--card)",

  border: "1px solid var(--border)",

  borderRadius: 18,

  padding: 22,

  marginBottom: 22

}


const summaryCardStyle: React.CSSProperties = {

  background: "var(--card)",

  border: "1px solid var(--border)",

  borderRadius: 15,

  padding: 20,

  textAlign: "center"

}


const mutedTextStyle: React.CSSProperties = {

  fontSize: 13,

  color: "var(--muted-foreground)",

  marginTop: 8

}


const progressBackgroundStyle: React.CSSProperties = {

  height: 9,

  background: "var(--border)",

  borderRadius: 20,

  overflow: "hidden",

  marginBottom: 12

}


const progressFillStyle: React.CSSProperties = {

  height: "100%",

  background: "linear-gradient(90deg, #2563EB, #06B6D4)",

  borderRadius: 20,

  transition: "width 0.3s"

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


const resourceButtonStyle: React.CSSProperties = {

  display: "inline-block",

  padding: "9px 14px",

  background: "#2563EB",

  color: "white",

  borderRadius: 8,

  textDecoration: "none",

  fontSize: 12,

  fontWeight: 700

}


function getPriorityStyle(priority: string): React.CSSProperties {

  const normalized = priority.toLowerCase()


  let background = "#DBEAFE"

  let color = "#1D4ED8"


  if (normalized === "high") {

    background = "#FEE2E2"

    color = "#B91C1C"

  } else if (normalized === "low") {

    background = "#DCFCE7"

    color = "#15803D"

  }


  return {

    fontSize: 11,

    fontWeight: 750,

    padding: "5px 9px",

    borderRadius: 20,

    background,

    color

  }

}