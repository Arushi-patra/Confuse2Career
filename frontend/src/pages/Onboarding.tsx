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

        placement_date: `${placementDate}-01`,

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

            placement_date: `${placementDate}-01`,

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

  //     const response = await apiRequest("/roadmap/generate", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         placement_date: `${placementDate}-01`,
  //         target_role: targetRole,
  //         dream_company: dreamCompany,
  //         study_hours: numericStudyHours,
  //         skills: [],
  //         skill_level: skillLevel
  //       })
  //     })

  //     console.log("Roadmap generated:", response)

  //     // Preserve the onboarding answers in the current profile context.
  //     // Other profile fields are retained.
  //     saveProfile({
  //       ...profile,
  //       placementDate,
  //       studyHours: String(numericStudyHours),
  //       dreamCompany,
  //       targetRole
  //     })

  //     navigate("/dashboard/roadmap")

  //   } catch (err) {
  //     console.error("Roadmap generation failed:", err)

  //     setError(
  //       err instanceof Error
  //         ? err.message
  //         : "Failed to generate your roadmap."
  //     )
  //   } finally {
  //     setGenerating(false)
  //   }
  // }

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




// import { useState } from "react"
// import { useNavigate } from "react-router"
// import { apiRequest } from "../api/api"

// const dreamCompanies = [
//   "Google",
//   "Microsoft",
//   "Amazon",
//   "Meta",
//   "Apple",
//   "Netflix",
//   "Adobe",
//   "Flipkart",
//   "Swiggy",
//   "Zomato",
//   "Infosys",
//   "TCS",
//   "Wipro",
//   "Other",
// ]

// const studyOptions = [
//   "1-2 Hours",
//   "2-3 Hours",
//   "3-4 Hours",
//   "4-5 Hours",
//   "5+ Hours",
// ]

// export default function Onboarding() {
//   const navigate = useNavigate()
//   const [step, setStep] = useState(0)
//   const [placementDate, setPlacementDate] = useState("")
//   const [studyHours, setStudyHours] = useState("")
//   const [dreamCompany, setDreamCompany] = useState("")
//   const [skillLevel, setSkillLevel] = useState("")
//   const [generating, setGenerating] = useState(false)

//   // const handleGenerate = () => {
//   //   setGenerating(true)
//   //   setTimeout(() => navigate("/dashboard"), 2800)
//   // }
//   const handleGenerate = async () => {
//     setGenerating(true)

//     try {
//       const response = await apiRequest("/roadmap/generate", {
//         method: "POST",
//         body: JSON.stringify({
//           placement_date: `${placementDate}-01`,
//           // target_role: "Software Engineer"
//           target_role: targetRole,
//           dream_company: dreamCompany,
//           study_hours: Number(studyHours),
//           skills: [],
//         }),
//       })

//       console.log("Roadmap generated:", response)

//       navigate("/dashboard")

//     } catch (error) {
//       console.error("Roadmap generation failed:", error)
//       alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to generate roadmap"
//       )
//     } finally {
//       setGenerating(false)
//     }
//   }

//   const canProceed = [
//     placementDate.length > 0,
//     studyHours.length > 0,
//     dreamCompany.length > 0 && skillLevel.length > 0,
//   ][step]

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "var(--background)",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "24px",
//       }}
//     >
//       {/* Brand */}
//       <div
//         style={{
//           position: "fixed",
//           top: 24,
//           left: 28,
//           display: "flex",
//           alignItems: "center",
//           gap: 8,
//           cursor: "pointer",
//         }}
//         onClick={() => navigate("/")}
//       >
//         <div
//           style={{
//             width: 32,
//             height: 32,
//             borderRadius: 8,
//             background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: 16,
//           }}
//         >
//           🎯
//         </div>
//         <span
//           style={{
//             fontFamily: "Outfit, sans-serif",
//             fontWeight: 700,
//             fontSize: 17,
//             color: "var(--foreground)",
//           }}
//         >
//           Confused<span style={{ color: "var(--primary)" }}>2</span>Career
//         </span>
//       </div>

//       {generating ? (
//         <GeneratingScreen />
//       ) : (
//         <div style={{ width: "100%", maxWidth: 520 }}>
//           {/* Progress */}
//           <div style={{ marginBottom: 40 }}>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 marginBottom: 10,
//                 fontSize: 13,
//                 color: "var(--muted-foreground)",
//                 fontWeight: 500,
//               }}
//             >
//               <span>Step {step + 1} of 3</span>
//               <span>{Math.round(((step + 1) / 3) * 100)}% complete</span>
//             </div>
//             <div
//               style={{
//                 height: 4,
//                 background: "var(--border)",
//                 borderRadius: 100,
//                 overflow: "hidden",
//               }}
//             >
//               <div
//                 style={{
//                   height: "100%",
//                   width: `${((step + 1) / 3) * 100}%`,
//                   background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
//                   borderRadius: 100,
//                   transition: "width 0.4s ease",
//                 }}
//               />
//             </div>
//           </div>

//           <div
//             style={{
//               background: "var(--card)",
//               borderRadius: 24,
//               border: "1px solid var(--border)",
//               padding: "40px 36px",
//               boxShadow: "0 4px 24px rgba(79,70,229,0.06)",
//             }}
//           >
//             {step === 0 && (
//               <StepPlacementDate
//                 value={placementDate}
//                 onChange={setPlacementDate}
//               />
//             )}
//             {step === 1 && (
//               <StepStudyHours
//                 value={studyHours}
//                 onChange={setStudyHours}
//                 options={studyOptions}
//               />
//             )}
//             {step === 2 && (
//               <StepDreamCompany
//                 company={dreamCompany}
//                 onCompany={setDreamCompany}
//                 skillLevel={skillLevel}
//                 onSkill={setSkillLevel}
//                 companies={dreamCompanies}
//               />
//             )}

//             <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
//               {step > 0 && (
//                 <button
//                   onClick={() => setStep((s) => s - 1)}
//                   style={{
//                     flex: 1,
//                     padding: "13px",
//                     borderRadius: 12,
//                     border: "1.5px solid var(--border)",
//                     background: "transparent",
//                     color: "var(--foreground)",
//                     fontWeight: 600,
//                     fontSize: 15,
//                     cursor: "pointer",
//                     fontFamily: "Outfit, sans-serif",
//                   }}
//                 >
//                   ← Back
//                 </button>
//               )}
//               <button
//                 disabled={!canProceed}
//                 onClick={() => {
//                   if (step < 2) setStep((s) => s + 1)
//                   else handleGenerate()
//                 }}
//                 style={{
//                   flex: 2,
//                   padding: "13px",
//                   borderRadius: 12,
//                   border: "none",
//                   background: canProceed
//                     ? "linear-gradient(135deg, #4F46E5, #7C3AED)"
//                     : "var(--muted)",
//                   color: canProceed ? "#fff" : "var(--muted-foreground)",
//                   fontWeight: 700,
//                   fontSize: 15,
//                   cursor: canProceed ? "pointer" : "not-allowed",
//                   fontFamily: "Outfit, sans-serif",
//                   transition: "all 0.2s",
//                 }}
//               >
//                 {step < 2 ? "Continue →" : "🚀 Generate My Plan"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>

    
//   )
// }

// function StepPlacementDate({
//   value,
//   onChange,
// }: {
//   value: string
//   onChange: (v: string) => void
// }) {
//   return (
//     <div>
//       <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
//       <h2
//         style={{
//           fontFamily: "Outfit, sans-serif",
//           fontSize: 26,
//           fontWeight: 800,
//           letterSpacing: "-0.4px",
//           marginBottom: 8,
//         }}
//       >
//         When is your placement?
//       </h2>
//       <p
//         style={{
//           color: "var(--muted-foreground)",
//           fontSize: 14,
//           marginBottom: 28,
//         }}
//       >
//         This helps us calculate how much time you have to prepare.
//       </p>
//       <input
//         type="month"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         style={{
//           width: "100%",
//           padding: "14px 16px",
//           borderRadius: 12,
//           border: `2px solid ${value ? "var(--primary)" : "var(--border)"}`,
//           background: "var(--background)",
//           fontSize: 16,
//           fontFamily: "Inter, sans-serif",
//           color: "var(--foreground)",
//           outline: "none",
//           transition: "border-color 0.2s",
//         }}
//       />
//     </div>
//   )
// }

// function StepStudyHours({
//   value,
//   onChange,
//   options,
// }: {
//   value: string
//   onChange: (v: string) => void
//   options: string[]
// }) {
//   return (
//     <div>
//       <div style={{ fontSize: 28, marginBottom: 8 }}>⏱️</div>
//       <h2
//         style={{
//           fontFamily: "Outfit, sans-serif",
//           fontSize: 26,
//           fontWeight: 800,
//           letterSpacing: "-0.4px",
//           marginBottom: 8,
//         }}
//       >
//         How many hours can you study daily?
//       </h2>
//       <p
//         style={{
//           color: "var(--muted-foreground)",
//           fontSize: 14,
//           marginBottom: 28,
//         }}
//       >
//         Be realistic — consistency matters more than intensity.
//       </p>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//         {options.map((opt) => (
//           <button
//             key={opt}
//             onClick={() => onChange(opt)}
//             style={{
//               padding: "14px",
//               borderRadius: 12,
//               border: `2px solid ${
//                 value === opt ? "var(--primary)" : "var(--border)"
//               }`,
//               background:
//                 value === opt ? "var(--secondary)" : "var(--background)",
//               color: value === opt ? "var(--primary)" : "var(--foreground)",
//               fontWeight: value === opt ? 700 : 500,
//               fontSize: 15,
//               cursor: "pointer",
//               fontFamily: "Inter, sans-serif",
//               transition: "all 0.15s",
//             }}
//           >
//             {opt}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// function StepDreamCompany({
//   company,
//   onCompany,
//   skillLevel,
//   onSkill,
//   companies,
// }: {
//   company: string
//   onCompany: (v: string) => void
//   skillLevel: string
//   onSkill: (v: string) => void
//   companies: string[]
// }) {
//   return (
//     <div>
//       <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
//       <h2
//         style={{
//           fontFamily: "Outfit, sans-serif",
//           fontSize: 26,
//           fontWeight: 800,
//           letterSpacing: "-0.4px",
//           marginBottom: 8,
//         }}
//       >
//         Dream company & skill level
//       </h2>
//       <p
//         style={{
//           color: "var(--muted-foreground)",
//           fontSize: 14,
//           marginBottom: 24,
//         }}
//       >
//         We'll tailor your roadmap to match your target company's expectations.
//       </p>

//       <div style={{ marginBottom: 20 }}>
//         <label
//           style={{
//             fontSize: 12,
//             fontWeight: 700,
//             color: "var(--muted-foreground)",
//             letterSpacing: "0.8px",
//             textTransform: "uppercase",
//             display: "block",
//             marginBottom: 10,
//           }}
//         >
//           Target Company
//         </label>
//         <div
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: 8,
//           }}
//         >
//           {companies.map((c) => (
//             <button
//               key={c}
//               onClick={() => onCompany(c)}
//               style={{
//                 padding: "7px 14px",
//                 borderRadius: 100,
//                 border: `1.5px solid ${
//                   company === c ? "var(--primary)" : "var(--border)"
//                 }`,
//                 background: company === c ? "var(--secondary)" : "var(--card)",
//                 color: company === c ? "var(--primary)" : "var(--foreground)",
//                 fontWeight: company === c ? 700 : 500,
//                 fontSize: 13,
//                 cursor: "pointer",
//                 fontFamily: "Inter, sans-serif",
//               }}
//             >
//               {c}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div>
//         <label
//           style={{
//             fontSize: 12,
//             fontWeight: 700,
//             color: "var(--muted-foreground)",
//             letterSpacing: "0.8px",
//             textTransform: "uppercase",
//             display: "block",
//             marginBottom: 10,
//           }}
//         >
//           Current Skill Level
//         </label>
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr 1fr",
//             gap: 10,
//           }}
//         >
//           {["Beginner", "Intermediate", "Advanced"].map((level) => (
//             <button
//               key={level}
//               onClick={() => onSkill(level)}
//               style={{
//                 padding: "12px 8px",
//                 borderRadius: 12,
//                 border: `2px solid ${
//                   skillLevel === level ? "var(--primary)" : "var(--border)"
//                 }`,
//                 background:
//                   skillLevel === level
//                     ? "var(--secondary)"
//                     : "var(--background)",
//                 color:
//                   skillLevel === level ? "var(--primary)" : "var(--foreground)",
//                 fontWeight: skillLevel === level ? 700 : 500,
//                 fontSize: 14,
//                 cursor: "pointer",
//                 fontFamily: "Inter, sans-serif",
//               }}
//             >
//               {level === "Beginner"
//                 ? "🌱"
//                 : level === "Intermediate"
//                   ? "📈"
//                   : "🔥"}{" "}
//               {level}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// function GeneratingScreen() {
//   const [progress, setProgress] = useState(0)
//   const steps = [
//     "Analyzing your profile...",
//     "Mapping skill gaps...",
//     "Building your roadmap...",
//     "Generating ATS resume template...",
//     "Curating course recommendations...",
//     "Finalizing your plan...",
//   ]
//   const [currentMsg, setCurrentMsg] = useState(0)

//   useState(() => {
//     const t1 = setInterval(() => setProgress((p) => Math.min(p + 2, 100)), 60)
//     const t2 = setInterval(
//       () => setCurrentMsg((m) => (m + 1 < steps.length ? m + 1 : m)),
//       420,
//     )
//     return () => {
//       clearInterval(t1)
//       clearInterval(t2)
//     }
//   })

//   return (
//     <div style={{ textAlign: "center", maxWidth: 400 }}>
//       <div style={{ fontSize: 56, marginBottom: 24 }}>🧠</div>
//       <h2
//         style={{
//           fontFamily: "Outfit, sans-serif",
//           fontSize: 28,
//           fontWeight: 800,
//           letterSpacing: "-0.4px",
//           marginBottom: 12,
//         }}
//       >
//         Building your career plan
//       </h2>
//       <p
//         style={{
//           color: "var(--muted-foreground)",
//           fontSize: 14,
//           marginBottom: 36,
//         }}
//       >
//         Our AI is crafting a personalized roadmap just for you...
//       </p>
//       <div
//         style={{
//           background: "var(--card)",
//           border: "1px solid var(--border)",
//           borderRadius: 16,
//           padding: "28px 32px",
//         }}
//       >
//         <div
//           style={{
//             height: 6,
//             background: "var(--muted)",
//             borderRadius: 100,
//             overflow: "hidden",
//             marginBottom: 16,
//           }}
//         >
//           <div
//             style={{
//               height: "100%",
//               width: `${progress}%`,
//               background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
//               borderRadius: 100,
//               transition: "width 0.1s linear",
//             }}
//           />
//         </div>
//         <div
//           style={{
//             fontSize: 13,
//             color: "var(--muted-foreground)",
//             fontStyle: "italic",
//           }}
//         >
//           {steps[currentMsg]}
//         </div>
//         <div
//           style={{
//             fontSize: 22,
//             fontWeight: 800,
//             fontFamily: "Outfit, sans-serif",
//             color: "var(--primary)",
//             marginTop: 8,
//           }}
//         >
//           {progress}%
//         </div>
//       </div>
//     </div>
//   )
// }
