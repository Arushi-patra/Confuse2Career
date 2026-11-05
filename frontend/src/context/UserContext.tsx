import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { apiRequest } from '../api/api'

export interface UserProfile {
  name: string
  email: string
  college: string
  branch: string
  year: string
  placementDate: string
  studyHours: string
  dreamCompany: string
  targetRole: string
  resumeFile: string
  githubLink: string
  codingPlatform: 'leetcode' | 'hackerrank' | ''
  codingLink: string
}

interface AuthUser {
  id: number
  name: string
  email: string
  role: string
}

interface BackendProfile {
  college: string | null
  branch: string | null
  year: string | null
  placement_date: string | null
  daily_study_hours: number | null
  dream_company: string | null
  target_role: string | null
  github_link: string | null
  coding_platform: string | null
  coding_link: string | null
  resume_file_name: string | null
}

interface UserContextValue {
  isLoggedIn: boolean
  isAuthLoading: boolean
  isProfileComplete: boolean
  profile: UserProfile
  loginEmail: string
  authUser: AuthUser | null

  login: (user: AuthUser) => void
  logout: () => void
  saveProfile: (data: UserProfile) => void
  refreshProfile: () => Promise<boolean>
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  college: '',
  branch: '',
  year: '',
  placementDate: '',
  studyHours: '',
  dreamCompany: '',
  targetRole: '',
  resumeFile: '',
  githubLink: '',
  codingPlatform: '',
  codingLink: '',
}

const UserContext = createContext<UserContextValue | undefined>(
  undefined
)


export function UserProvider({
  children,
}: {
  children: ReactNode
}) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const [isProfileComplete, setIsProfileComplete] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')

  const [authUser, setAuthUser] = useState<AuthUser | null>(null)

  const [profile, setProfile] = useState<UserProfile>(
    defaultProfile
  )


  // Convert backend profile format into frontend format.
  const mapBackendProfile = (
    data: BackendProfile,
    user: AuthUser
  ): UserProfile => {

    return {
      name: user.name,
      email: user.email,

      college: data.college || '',
      branch: data.branch || '',
      year: data.year || '',

      placementDate: data.placement_date
        ? data.placement_date.slice(0, 7)
        : '',

      studyHours: data.daily_study_hours != null
        ? String(data.daily_study_hours)
        : '',

      dreamCompany: data.dream_company || '',
      targetRole: data.target_role || '',

      resumeFile: data.resume_file_name || '',

      githubLink: data.github_link || '',

      codingPlatform:
        data.coding_platform === 'leetcode' ||
        data.coding_platform === 'hackerrank'
          ? data.coding_platform
          : '',

      codingLink: data.coding_link || '',
    }
  }


  // Fetch the current user's profile from the backend.
  const refreshProfile = async (): Promise<boolean> => {

    try {

      const data = await apiRequest(
        '/profile'
      ) as BackendProfile

      if (!authUser) {
        return false
      }

      const loadedProfile = mapBackendProfile(
        data,
        authUser
      )

      setProfile(loadedProfile)

      const complete =
        Boolean(loadedProfile.college) &&
        Boolean(loadedProfile.branch) &&
        Boolean(loadedProfile.year) &&
        Boolean(loadedProfile.placementDate) &&
        Boolean(loadedProfile.studyHours) &&
        Boolean(loadedProfile.dreamCompany) &&
        Boolean(loadedProfile.targetRole) &&
        Boolean(loadedProfile.githubLink) &&
        Boolean(loadedProfile.resumeFile)

      setIsProfileComplete(complete)

      return true

    } catch (error) {

      if (
        error instanceof Error &&
        error.message.includes('Profile not found')
      ) {

        setProfile({
          ...defaultProfile,
          name: authUser?.name || '',
          email: authUser?.email || '',
        })

        setIsProfileComplete(false)

        return false
      }

      throw error
    }
  }


  // Restore authentication and profile after a browser refresh.
  useEffect(() => {

    const restoreSession = async () => {

      const token = localStorage.getItem(
        'access_token'
      )

      if (!token) {

        setIsAuthLoading(false)

        return
      }

      try {

        const user = await apiRequest(
          '/auth/me'
        ) as AuthUser

        setAuthUser(user)

        setIsLoggedIn(true)

        setLoginEmail(user.email)

        const data = await apiRequest(
          '/profile'
        ) as BackendProfile

        const loadedProfile = mapBackendProfile(
          data,
          user
        )

        setProfile(loadedProfile)

        const complete =
          Boolean(loadedProfile.college) &&
          Boolean(loadedProfile.branch) &&
          Boolean(loadedProfile.year) &&
          Boolean(loadedProfile.placementDate) &&
          Boolean(loadedProfile.studyHours) &&
          Boolean(loadedProfile.dreamCompany) &&
          Boolean(loadedProfile.targetRole) &&
          Boolean(loadedProfile.githubLink) &&
          Boolean(loadedProfile.resumeFile)

        setIsProfileComplete(complete)

      } catch (error) {

        console.error(
          'Session/profile restoration error:',
          error
        )

        // A missing profile does not mean the user is logged out.
        if (
          error instanceof Error &&
          error.message.includes('Profile not found')
        ) {

          setProfile({
            ...defaultProfile,
            name: authUser?.name || '',
            email: authUser?.email || '',
          })

          setIsProfileComplete(false)

        } else {

          // Keep the session if the failure was a temporary
          // profile/network error. Only authentication failures
          // should require logging in again.
          if (
            error instanceof Error &&
            (
              error.message.includes('Invalid or expired token') ||
              error.message.includes('Not authenticated')
            )
          ) {

            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')

            setIsLoggedIn(false)
            setAuthUser(null)
            setLoginEmail('')
            setProfile(defaultProfile)
            setIsProfileComplete(false)
          }
        }

      } finally {

        setIsAuthLoading(false)
      }
    }

    void restoreSession()

  }, [])


  const login = (user: AuthUser) => {

    setAuthUser(user)

    setIsLoggedIn(true)

    setLoginEmail(user.email)

    setProfile({
      ...defaultProfile,
      name: user.name,
      email: user.email,
    })

    setIsProfileComplete(false)
  }


  const logout = () => {

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    setIsLoggedIn(false)

    setIsProfileComplete(false)

    setIsAuthLoading(false)

    setLoginEmail('')

    setAuthUser(null)

    setProfile(defaultProfile)
  }


  const saveProfile = (data: UserProfile) => {

    setProfile(data)

    setIsProfileComplete(
      Boolean(data.college) &&
      Boolean(data.branch) &&
      Boolean(data.year) &&
      Boolean(data.placementDate) &&
      Boolean(data.studyHours) &&
      Boolean(data.dreamCompany) &&
      Boolean(data.targetRole) &&
      Boolean(data.githubLink) &&
      Boolean(data.resumeFile)
    )
  }


  return (
    <UserContext.Provider
      value={{
        isLoggedIn,
        isAuthLoading,
        isProfileComplete,
        profile,
        loginEmail,
        authUser,
        login,
        logout,
        saveProfile,
        refreshProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}


export const useUser = () => {

  const context = useContext(UserContext)

  if (!context) {
    throw new Error(
      'useUser must be used inside UserProvider'
    )
  }

  return context
}



// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   type ReactNode,
// } from 'react'

// import { apiRequest } from '../api/api'

// export interface UserProfile {
//   name: string
//   email: string
//   college: string
//   branch: string
//   year: string
//   placementDate: string
//   studyHours: string
//   dreamCompany: string
//   targetRole: string
//   resumeFile: string
//   githubLink: string
//   codingPlatform: 'leetcode' | 'hackerrank' | ''
//   codingLink: string
// }

// export interface AuthUser {
//   id: number
//   name: string
//   email: string
//   role: string
// }

// interface BackendProfile {
//   college?: string | null
//   branch?: string | null
//   year?: string | null
//   placement_date?: string | null
//   daily_study_hours?: number | null
//   dream_company?: string | null
//   target_role?: string | null
//   github_link?: string | null
//   coding_platform?: string | null
//   coding_link?: string | null
//   resume_file_name?: string | null
// }

// interface UserContextValue {
//   isLoggedIn: boolean
//   isAuthLoading: boolean
//   isProfileComplete: boolean
//   profile: UserProfile
//   loginEmail: string
//   authUser: AuthUser | null
//   login: (user: AuthUser) => void
//   logout: () => void
//   saveProfile: (data: UserProfile) => void
//   refreshProfile: () => Promise<void>
// }

// const defaultProfile: UserProfile = {
//   name: '',
//   email: '',
//   college: '',
//   branch: '',
//   year: '',
//   placementDate: '',
//   studyHours: '',
//   dreamCompany: '',
//   targetRole: '',
//   resumeFile: '',
//   githubLink: '',
//   codingPlatform: '',
//   codingLink: '',
// }

// const UserContext = createContext<UserContextValue | undefined>(undefined)

// function mapBackendProfile(
//   data: BackendProfile,
//   user: AuthUser
// ): UserProfile {
//   return {
//     name: user.name || '',
//     email: user.email || '',
//     college: data.college || '',
//     branch: data.branch || '',
//     year: data.year || '',

//     placementDate: data.placement_date
//       ? data.placement_date.slice(0, 7)
//       : '',

//     studyHours: data.daily_study_hours != null
//       ? String(data.daily_study_hours)
//       : '',

//     dreamCompany: data.dream_company || '',
//     targetRole: data.target_role || '',
//     resumeFile: data.resume_file_name || '',
//     githubLink: data.github_link || '',

//     codingPlatform:
//       data.coding_platform === 'leetcode' ||
//       data.coding_platform === 'hackerrank'
//         ? data.coding_platform
//         : '',

//     codingLink: data.coding_link || '',
//   }
// }

// function checkProfileComplete(profile: UserProfile): boolean {
//   return Boolean(
//     profile.name.trim() &&
//     profile.email.trim() &&
//     profile.college.trim() &&
//     profile.branch.trim() &&
//     profile.year.trim() &&
//     profile.placementDate.trim() &&
//     profile.studyHours.trim() &&
//     profile.dreamCompany.trim() &&
//     profile.targetRole.trim() &&
//     profile.githubLink.trim() &&
//     profile.resumeFile.trim()
//   )
// }

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [isAuthLoading, setIsAuthLoading] = useState(true)
//   const [isProfileComplete, setIsProfileComplete] = useState(false)

//   const [loginEmail, setLoginEmail] = useState('')
//   const [authUser, setAuthUser] = useState<AuthUser | null>(null)
//   const [profile, setProfile] = useState<UserProfile>(defaultProfile)

//   const loadSavedProfile = async (user: AuthUser) => {
//     try {
//       const data = await apiRequest('/profile') as BackendProfile

//       const loadedProfile = mapBackendProfile(data, user)

//       setProfile(loadedProfile)
//       setIsProfileComplete(checkProfileComplete(loadedProfile))

//       return loadedProfile

//     } catch (error) {
//       // A 404 means this user has not created a profile yet.
//       if (
//         error instanceof Error &&
//         error.message.toLowerCase().includes('profile not found')
//       ) {
//         const emptyProfile = {
//           ...defaultProfile,
//           name: user.name,
//           email: user.email,
//         }

//         setProfile(emptyProfile)
//         setIsProfileComplete(false)

//         return emptyProfile
//       }

//       // Do not log the user out just because the profile API failed.
//       console.error('Unable to load saved profile:', error)

//       throw error
//     }
//   }

//   const refreshProfile = async () => {
//     if (!authUser) {
//       return
//     }

//     await loadSavedProfile(authUser)
//   }

//   // Restore the authentication session after a browser refresh.
//   useEffect(() => {
//     let cancelled = false

//     const restoreSession = async () => {
//       const token = localStorage.getItem('access_token')

//       if (!token) {
//         if (!cancelled) {
//           setIsAuthLoading(false)
//         }
//         return
//       }

//       try {
//         const user = await apiRequest('/auth/me') as AuthUser

//         if (cancelled) return

//         setAuthUser(user)
//         setIsLoggedIn(true)
//         setLoginEmail(user.email)

//         await loadSavedProfile(user)

//       } catch (error) {
//         console.error('Session restoration failed:', error)

//         // Only clear authentication for an invalid/expired session.
//         if (
//           error instanceof Error &&
//           error.message.toLowerCase().includes('invalid')
//         ) {
//           localStorage.removeItem('access_token')
//           localStorage.removeItem('refresh_token')

//           setIsLoggedIn(false)
//           setAuthUser(null)
//           setLoginEmail('')
//           setProfile(defaultProfile)
//           setIsProfileComplete(false)
//         }

//       } finally {
//         if (!cancelled) {
//           setIsAuthLoading(false)
//         }
//       }
//     }

//     void restoreSession()

//     return () => {
//       cancelled = true
//     }
//   }, [])

//   const login = (user: AuthUser) => {
//     setAuthUser(user)
//     setIsLoggedIn(true)
//     setLoginEmail(user.email)

//     setProfile({
//       ...defaultProfile,
//       name: user.name,
//       email: user.email,
//     })

//     setIsProfileComplete(false)

//     // Load the user's saved profile after authentication.
//     void loadSavedProfile(user).catch(error => {
//       console.error('Profile loading after login failed:', error)
//     })
//   }

//   const logout = () => {
//     localStorage.removeItem('access_token')
//     localStorage.removeItem('refresh_token')

//     setIsLoggedIn(false)
//     setIsProfileComplete(false)
//     setIsAuthLoading(false)

//     setLoginEmail('')
//     setAuthUser(null)
//     setProfile(defaultProfile)
//   }

//   const saveProfile = (data: UserProfile) => {
//     setProfile(data)
//     setIsProfileComplete(checkProfileComplete(data))
//   }

//   return (
//     <UserContext.Provider
//       value={{
//         isLoggedIn,
//         isAuthLoading,
//         isProfileComplete,
//         profile,
//         loginEmail,
//         authUser,
//         login,
//         logout,
//         saveProfile,
//         refreshProfile,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   )
// }

// export const useUser = () => {
//   const context = useContext(UserContext)

//   if (!context) {
//     throw new Error('useUser must be used inside UserProvider')
//   }

//   return context
// }


