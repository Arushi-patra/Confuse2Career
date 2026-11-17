import { useState } from "react"
import { useNavigate } from "react-router"
import { apiRequest } from "../api/api"
import { useUser } from "../context/UserContext"

const dreamCompanies = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple",
  "Netflix", "Adobe", "Flipkart", "Swiggy", "Zomato",
  "Infosys", "TCS", "Wipro", "Other"
]

const studyOptions = [
  "1-2 Hours",
  "2-3 Hours",
  "3-4 Hours",
  "4-5 Hours",
  "5+ Hours"
]

const targetRoles = [
  "Software Developer",
  "Full Stack Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "Cloud Engineer",
  "Cybersecurity Engineer",
  "Other"
]

function convertStudyHours(value: string): number {
  if (value === "5+ Hours") return 5

  const numbers = value.match(/\d+/g)

  if (!numbers || numbers.length < 2) return 2

  return (Number(numbers[0]) + Number(numbers[1])) / 2
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { saveProfile, profile, authUser } = useUser()

  const [step, setStep] = useState(0)

  const [placementDate, setPlacementDate] = useState("")
  const [studyHours, setStudyHours] = useState("")
  const [dreamCompany, setDreamCompany] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [skillLevel, setSkillLevel] = useState("")

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const canProceed = [
    placementDate.length > 0,
    studyHours.length > 0,
    dreamCompany.length > 0 &&
      targetRole.length > 0 &&
      skillLevel.length > 0
  ][step]

  const handleGenerate = async () => {

    setGenerating(true)

    setError("")

    try {

      const numericStudyHours = convertStudyHours(
        studyHours
      )

      // Step 1: Save onboarding information in the database.
      const profilePayload = {

        placement_date: new Date(
          Number(placementDate.split("-")[0]),
          Number(placementDate.split("-")[1]),
          0
        ).toISOString().slice(0, 10),

        daily_study_hours: Math.round(
          numericStudyHours
        ),

        dream_company: dreamCompany,

        target_role: targetRole,

      }

      await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify(profilePayload),
      })


      // Step 2: Generate the personalized roadmap.
      const response = await apiRequest(
        "/roadmap/generate",
        {
          method: "POST",

          body: JSON.stringify({

            placement_date: new Date(
              Number(placementDate.split("-")[0]),
              Number(placementDate.split("-")[1]),
              0
            ).toISOString().slice(0, 10),

            target_role: targetRole,

            dream_company: dreamCompany,

            study_hours: numericStudyHours,

            skills: [],

            skill_level: skillLevel,

          }),
        }
      )


      console.log(
        "Roadmap generated:",
        response
      )


      // Step 3: Update the frontend profile state.
      saveProfile({

        ...profile,

        name: authUser?.name || profile.name,

        email: authUser?.email || profile.email,

        placementDate,

        studyHours: String(
          Math.round(numericStudyHours)
        ),

        dreamCompany,

        targetRole,

      })


      // Step 4: Navigate to the generated roadmap.
      navigate("/dashboard/roadmap")


    } catch (err) {

      console.error(
        "Onboarding/roadmap generation failed:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save onboarding information."
      )

    } finally {

      setGenerating(false)

    }
  }

  // const handleGenerate = async () => {
  //   setGenerating(true)
  //   setError("")

  //   try {
  //     const numericStudyHours = convertStudyHours(studyHours)

  
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>

        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 36 }}>🎯</div>

          <h1 style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--foreground)"
          }}>
            Build Your Career Roadmap
          </h1>

          <p style={{ color: "var(--muted-foreground)", fontSize: 14 }}>
            Tell us about your placement goals so we can create a preparation plan.
          </p>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          color: "var(--muted-foreground)",
          fontSize: 13
        }}>
          <span>Step {step + 1} of 3</span>
          <span>{Math.round(((step + 1) / 3) * 100)}%</span>
        </div>

        <div style={{
          height: 5,
          background: "var(--border)",
          borderRadius: 20,
          marginBottom: 25
        }}>
          <div style={{
            width: `${((step + 1) / 3) * 100}%`,
            height: "100%",
            background: "var(--primary)",
            borderRadius: 20
          }} />
        </div>

        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 30
        }}>

          {step === 0 && (
            <>
              <h2>📅 When is your placement?</h2>

              <p style={{ color: "var(--muted-foreground)" }}>
                Select the expected month of your placement.
              </p>

              <input
                type="month"
                value={placementDate}
                min={new Date().toISOString().slice(0, 7)}
                onChange={e => setPlacementDate(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          {step === 1 && (
            <>
              <h2>⏱️ Daily study hours</h2>

              <p style={{ color: "var(--muted-foreground)" }}>
                How much time can you dedicate to preparation each day?
              </p>

              <div style={gridStyle}>
                {studyOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setStudyHours(option)}
                    style={optionStyle(studyHours === option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>🚀 Your career goals</h2>

              <p style={{ color: "var(--muted-foreground)" }}>
                Select your dream company, target role and current skill level.
              </p>

              <label style={labelStyle}>Dream Company</label>

              <select
                value={dreamCompany}
                onChange={e => setDreamCompany(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select company</option>
                {dreamCompanies.map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>Target Role</label>

              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select role</option>
                {targetRoles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <label style={labelStyle}>Current Skill Level</label>

              <div style={gridStyle}>
                {["Beginner", "Intermediate", "Advanced"].map(level => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    style={optionStyle(skillLevel === level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <p style={{ color: "#DC2626", marginTop: 18, fontSize: 13 }}>
              {error}
            </p>
          )}

          <div style={{
            display: "flex",
            gap: 12,
            marginTop: 30
          }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={secondaryButtonStyle}
              >
                ← Back
              </button>
            )}

            <button
              disabled={!canProceed || generating}
              onClick={() => {
                if (step < 2) {
                  setStep(s => s + 1)
                } else {
                  void handleGenerate()
                }
              }}
              style={{
                ...primaryButtonStyle,
                opacity: canProceed && !generating ? 1 : 0.5,
                cursor: canProceed && !generating ? "pointer" : "not-allowed"
              }}
            >
              {generating
                ? "Generating..."
                : step < 2
                  ? "Continue →"
                  : "Generate My Roadmap"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  marginTop: 12,
  marginBottom: 20,
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--foreground)",
  fontSize: 14
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  marginTop: 18,
  color: "var(--muted-foreground)"
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10,
  marginTop: 14
}

const optionStyle = (selected: boolean): React.CSSProperties => ({
  padding: 13,
  borderRadius: 10,
  border: `2px solid ${selected ? "var(--primary)" : "var(--border)"}`,
  background: selected ? "var(--secondary)" : "var(--background)",
  color: "var(--foreground)",
  cursor: "pointer",
  fontWeight: selected ? 700 : 500
})

const primaryButtonStyle: React.CSSProperties = {
  flex: 2,
  padding: 14,
  border: "none",
  borderRadius: 10,
  background: "var(--primary)",
  color: "white",
  fontWeight: 700,
  fontSize: 14
}

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: 14,
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "transparent",
  color: "var(--foreground)",
  cursor: "pointer"
}

