import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useUser, type UserProfile } from '../context/UserContext'
import { useDarkMode } from '../hooks/useDarkMode'
import logoSvg from '../imports/logo.png'
import { apiRequest } from '../api/api'

const branches = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Other',
]

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Adobe', 'Netflix',
  'Flipkart', 'Swiggy', 'Zomato', 'Infosys', 'TCS', 'Wipro', 'Cognizant',
  'Accenture', 'Capgemini', 'Oracle', 'Salesforce', 'VMware', 'Intel',
  'Qualcomm', 'Nvidia', 'Samsung', 'IBM', 'Dell', 'HP', 'Cisco',
  'Uber', 'Lyft', 'Airbnb', 'Spotify', 'Twitter', 'Snapchat', 'Other',
]

const roles = [
  'Software Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cloud Engineer',
  'Cybersecurity Engineer',
  'Other',
]

const studyHourOptions = ['1', '2', '3', '4', '5', '6', '7', '8']

export default function Profile() {
  const navigate = useNavigate()
  const { profile, loginEmail, saveProfile, isProfileComplete, authUser, refreshProfile } = useUser()
  const [dark, toggleDark] = useDarkMode()

  const [editing, setEditing] = useState(!isProfileComplete)
  const [form, setForm] = useState<UserProfile>({
    ...profile,
    email: profile.email || loginEmail,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({})
  const [resumeFileName, setResumeFileName] = useState(profile.resumeFile || '')

  const set = (key: keyof UserProfile, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }
  const [saving, setSaving] = useState(false)
  const validate = () => {
    const required: (keyof UserProfile)[] = [
      'name', 'email', 'college', 'branch', 'year',
      'placementDate', 'studyHours', 'dreamCompany', 'targetRole', 'githubLink',
    ]
    const e: typeof errors = {}
    required.forEach(k => {
      if (!form[k]?.trim()) e[k] = 'This field is required'
    })
    if (!resumeFileName) e.resumeFile = 'Please upload your resume'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (form.githubLink && !form.githubLink.startsWith('http')) e.githubLink = 'Enter a valid URL (starting with http)'
    return e
  }

  // const handleSave = () => {
  //   const e = validate()
  //   if (Object.keys(e).length) { setErrors(e); return }
  //   saveProfile({ ...form, resumeFile: resumeFileName })
  //   navigate('/dashboard')
  // }
  const handleSave = async () => {
    const e = validate()

    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    try {
      const studyHours = parseInt(form.studyHours, 10)

      const profilePayload = {
        college: form.college,
        branch: form.branch,
        year: form.year,

        placement_date: `${form.placementDate}-01`,
        daily_study_hours: studyHours,

        dream_company: form.dreamCompany,
        target_role: form.targetRole,

        github_link: form.githubLink,

        coding_platform: form.codingPlatform || null,
        coding_link: form.codingLink || null,

        resume_file_name: resumeFileName,
      }

      await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profilePayload),
      })

      // saveProfile({
      //   ...form,
      //   name: authUser?.name || form.name,
      //   email: authUser?.email || form.email,
      //   resumeFile: resumeFileName,
      // })
      const updatedProfile: UserProfile = {
        ...form,

        name: authUser?.name || form.name,
        email: authUser?.email || loginEmail,

        studyHours: String(studyHours),

        resumeFile: resumeFileName,
      }

      saveProfile(updatedProfile)
      alert('Profile saved successfully!')

      navigate('/dashboard')

    } catch (error) {
      console.error('Profile save error:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Unable to save profile. Please try again.'
      )
    }
  }


  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.065)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(147,197,253,0.18)',
    boxShadow: '0 4px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
    borderRadius: 20,
  }

  const readonlyCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(147,197,253,0.15)',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#E2F0FF',
    fontSize: 15,
    fontFamily: 'Inter, sans-serif',
  }
  
  useEffect(() => {

    const loadProfile = async () => {

      try {

        await refreshProfile()

      } catch (error) {

        console.error(
          'Unable to load profile:',
          error
        )
      }
    }

    void loadProfile()

  }, [])
  // useEffect(() => {
  //   const loadProfile = async () => {
  //     try {
  //       const data = await apiRequest('/profile') as {
  //         college: string | null
  //         branch: string | null
  //         year: string | null
  //         placement_date: string | null
  //         daily_study_hours: number | null
  //         dream_company: string | null
  //         target_role: string | null
  //         github_link: string | null
  //         coding_platform: string | null
  //         coding_link: string | null
  //         resume_file_name: string | null
  //       }

  //       const loadedProfile: UserProfile = {
  //         ...form,
  //         college: data.college || '',
  //         branch: data.branch || '',
  //         year: data.year || '',
  //         placementDate: data.placement_date
  //           ? data.placement_date.slice(0, 7)
  //           : '',
  //         studyHours: data.daily_study_hours
  //           ? `${data.daily_study_hours} hours`
  //           : '',
  //         dreamCompany: data.dream_company || '',
  //         targetRole: data.target_role || '',
  //         githubLink: data.github_link || '',
  //         codingPlatform:
  //           data.coding_platform === 'leetcode' ||
  //           data.coding_platform === 'hackerrank'
  //             ? data.coding_platform
  //             : '',
  //         codingLink: data.coding_link || '',
  //         resumeFile: data.resume_file_name || '',
  //       }

  //       setForm(loadedProfile)
  //       setResumeFileName(data.resume_file_name || '')
  //       saveProfile(loadedProfile)
  //       setEditing(false)

  //     } catch (error) {
  //       if (
  //         error instanceof Error &&
  //         error.message.includes('Profile not found')
  //       ) {
  //         setEditing(true)
  //       } else {
  //         console.error('Unable to load profile:', error)
  //       }
  //     }
  //   }

  //   void loadProfile()
  // }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '0 0 60px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* BG orbs */}
      <div style={{ position: 'fixed', top: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--muted-primary)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logoSvg} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--foreground)' }}>
            Confused<span style={{ color: 'var(--primary)' }}>2</span>Career
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isProfileComplete && !editing && (
            <button onClick={() => navigate('/dashboard')} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#93C5FD', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ← Dashboard
            </button>
          )}
          <button onClick={toggleDark} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted-primary)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 24px 0', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 28px rgba(37,99,235,0.45)', fontSize: 28, }}>
            {isProfileComplete && !editing ? form.name.charAt(0).toUpperCase() || '👤' : '👤'}
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.4px', marginBottom: 8 }}>
            {isProfileComplete && !editing ? 'Your Profile' : isProfileComplete ? 'Edit Profile' : 'Set Up Your Profile'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
            {isProfileComplete && !editing
              ? 'Your career preparation profile'
              : 'Fill in your details to get a personalized career plan'}
          </p>
        </div>

        {/* View mode — show info + Edit button */}
        {isProfileComplete && !editing ? (
          <ViewProfile profile={form} resumeFileName={resumeFileName} glass={glass} readonlyCard={readonlyCard} onEdit={() => setEditing(true)} />
        ) : (
          <EditForm
            form={form}
            set={set}
            errors={errors}
            resumeFileName={resumeFileName}
            setResumeFileName={setResumeFileName}
            glass={glass}
            onSave={handleSave}
            isProfileComplete={isProfileComplete}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>

      <footer
        style={{
          borderTop: '0px solid var(--border)',
          padding: '30px',
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

function ViewProfile({ profile, resumeFileName, glass, readonlyCard, onEdit }: {
  profile: UserProfile
  resumeFileName: string
  glass: React.CSSProperties
  readonlyCard: React.CSSProperties
  onEdit: () => void
}) {
  const sections = [
    {
      title: '👤 Personal Information',
      items: [
        { label: 'Full Name', value: profile.name },
        { label: 'Email', value: profile.email },
      ],
    },
    {
      title: '🎓 Academic Information',
      items: [
        { label: 'College', value: profile.college },
        { label: 'Branch', value: profile.branch },
        { label: 'Year', value: profile.year },
      ],
    },
    {
      title: '🎯 Career & Placement',
      items: [
        { label: 'Placement Date', value: profile.placementDate },
        { label: 'Study Hours / Day', value: profile.studyHours + ' hours' },
        { label: 'Dream Company', value: profile.dreamCompany },
        { label: 'Target Role', value: profile.targetRole },
      ],
    },
    {
      title: '💼 Professional Profiles',
      items: [
        { label: 'Resume', value: resumeFileName || '—' },
        { label: 'GitHub', value: profile.githubLink },
      ],
    },
  ]

  return (
    <div>
      {sections.map(s => (
        <div key={s.title} style={{ ...glass, padding: '28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--foreground)', marginBottom: 20 }}>{s.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {s.items.map(it => (
              <div key={it.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>{it.label}</div>
                <div style={{ ...readonlyCard }}>{it.value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {profile.codingPlatform && (
        <div style={{ ...glass, padding: '28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--foreground)', marginBottom: 20 }}>💻 Coding Profile (Optional)</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>
              {profile.codingPlatform === 'leetcode' ? 'LeetCode' : 'HackerRank'}
            </div>
            <div style={{ ...readonlyCard }}>{profile.codingLink || '—'}</div>
          </div>
        </div>
      )}
      <button
        onClick={onEdit}
        style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 28px rgba(37,99,235,0.4)', letterSpacing: '0.2px' }}
      >
        ✏️ Edit Profile
      </button>
    </div>
  )
}

function EditForm({ form, set, errors, resumeFileName, setResumeFileName, glass, onSave, isProfileComplete, onCancel }: {
  form: UserProfile
  set: (k: keyof UserProfile, v: string) => void
  errors: Partial<Record<keyof UserProfile, string>>
  resumeFileName: string
  setResumeFileName: (v: string) => void
  glass: React.CSSProperties
  onSave: () => void
  isProfileComplete: boolean
  onCancel: () => void
}) {
  return (
    <div>
      {/* Personal Information */}
      <Section glass={glass} title="👤 Personal Information">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          <Field label="Full Name" required error={errors.name}>
            <GlassInput value={form.name} onChange={v => set('name', v)} placeholder="Arjun Sharma" />
          </Field>
          <Field label="Email Address" required error={errors.email}>
            <GlassInput type="email" value={form.email} onChange={v => set('email', v)} placeholder="arjun@example.com" />
          </Field>
        </div>
      </Section>

      {/* Academic */}
      <Section glass={glass} title="🎓 Academic Information">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, color: 'var(--foreground)' }}>
          <Field label="College" required error={errors.college}>
            <GlassInput value={form.college} onChange={v => set('college', v)} placeholder="IIT Bangalore" />
          </Field>
          <Field label="Branch" required error={errors.branch}>
            <GlassSelect value={form.branch} onChange={v => set('branch', v)} options={branches} placeholder="Select branch" />
          </Field>
          <Field label="Year" required error={errors.year}>
            <GlassSelect value={form.year} onChange={v => set('year', v)} options={years} placeholder="Select year" />
          </Field>
        </div>
      </Section>

      {/* Career */}
      <Section glass={glass} title="🎯 Career & Placement">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          <Field label="Placement Date" required error={errors.placementDate}>
            <GlassInput type="month" value={form.placementDate} onChange={v => set('placementDate', v)} />
          </Field>
          <Field label="Study Hours Per Day" required error={errors.studyHours}>
            <GlassSelect value={form.studyHours} onChange={v => set('studyHours', v)} options={studyHourOptions} placeholder="Select hours" />
          </Field>
          <Field label="Dream Company" required error={errors.dreamCompany}>
            <GlassSelect value={form.dreamCompany} onChange={v => set('dreamCompany', v)} options={companies} placeholder="Select company" />
          </Field>
          <Field label="Target Role" required error={errors.targetRole}>
            <GlassSelect value={form.targetRole} onChange={v => set('targetRole', v)} options={roles} placeholder="Select role" />
          </Field>
        </div>
      </Section>

      {/* Professional */}
      <Section glass={glass} title="💼 Professional Profiles">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          <Field label="Resume" required error={errors.resumeFile}>
            <ResumeUpload fileName={resumeFileName} onSelect={setResumeFileName} />
          </Field>
          <Field label="GitHub Profile Link" required error={errors.githubLink}>
            <GlassInput value={form.githubLink} onChange={v => set('githubLink', v)} placeholder="https://github.com/username" />
          </Field>
        </div>
      </Section>

      {/* Coding — optional */}
      <Section glass={glass} title="💻 Coding Profiles (Optional)">
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 14 }}>
            Choose one platform (optional) — you can skip this section
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            {(['', 'leetcode', 'hackerrank'] as const).map(p => (
              <button
                key={p}
                onClick={() => { set('codingPlatform', p); set('codingLink', '') }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 100,
                  border: `1.5px solid ${form.codingPlatform === p ? '#3B82F6' : 'rgba(147,197,253,0.2)'}`,
                  background: form.codingPlatform === p ? 'rgba(59,130,246,0.2)' : 'transparent',
                  color: form.codingPlatform === p ? '#3B82F6' : '#5d7084',
                  fontWeight: form.codingPlatform === p ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {p === '' ? 'Skip' : p === 'leetcode' ? '🟡 LeetCode' : '🟢 HackerRank'}
              </button>
            ))}
          </div>
          {form.codingPlatform !== '' && (
            <Field label={form.codingPlatform === 'leetcode' ? 'LeetCode Profile URL' : 'HackerRank Profile URL'}>
              <GlassInput value={form.codingLink} onChange={v => set('codingLink', v)} placeholder={form.codingPlatform === 'leetcode' ? 'https://leetcode.com/username' : 'https://hackerrank.com/username'} />
            </Field>
          )}
        </div>
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {isProfileComplete && (
          <button onClick={onCancel} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid rgba(147,197,253,0.25)', background: 'transparent', color: '#93C5FD', fontWeight: 600, fontSize: 15, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
            Cancel
          </button>
        )}
        <button
          onClick={onSave}
          style={{ flex: 2, padding: '15px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 28px rgba(37,99,235,0.4)', letterSpacing: '0.2px' }}
        >
          {isProfileComplete ? '💾 Save Changes' : '🚀 Complete Profile → Dashboard'}
        </button>
      </div>
    </div>

    
  )
}

function Section({ glass, title, children }: { glass: React.CSSProperties; title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...glass, padding: '28px', marginBottom: 20 }}>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--foreground)', marginBottom: 22 }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8, letterSpacing: '0.3px' }}>
        {label}{required && <span style={{ color: 'var(--destructive)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--destructive)', marginTop: 5 }}>{error}</div>}
    </div>
  )
}

function GlassInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: '1.5px solid rgba(147,197,253,0.2)',
        background: 'var(--muted-primary)',
        color: '#E2F0FF',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => (e.target.style.borderColor = '#3B82F6')}
      onBlur={e => (e.target.style.borderColor = 'rgba(147,197,253,0.2)')}
    />
  )
}

function GlassSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: '1.5px solid rgba(147,197,253,0.2)',
        background: 'var(--muted-primary)',
        color: value ? '#E2F0FF' : 'var(--muted-foreground)',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        boxSizing: 'border-box',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2393C5FD' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o} style={{ background: 'var(--muted-primary)', color: '#E2F0FF' }}>{o}</option>)}
    </select>
  )
}

function ResumeUpload({ fileName, onSelect }: { fileName: string; onSelect: (name: string) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 14px',
        borderRadius: 10,
        border: '1.5px dashed rgba(147,197,253,0.3)',
        background: 'var(--muted-primary)',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#3B82F6')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(147,197,253,0.3)')}
    >
      <span style={{ fontSize: 20 }}>📎</span>
      <span style={{ fontSize: 13, color: fileName ? '#93C5FD' : 'var(--muted-foreground)', fontFamily: 'Inter, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {fileName || 'Upload PDF / DOC / DOCX'}
      </span>
      {fileName && <span style={{ fontSize: 16 }}>✅</span>}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && onSelect(e.target.files[0].name)}
      />
    </label>

    
  )
}


