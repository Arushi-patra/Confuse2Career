const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001"

// Custom error class that preserves HTTP status codes
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access_token")
  const headers = new Headers(options.headers)

  // Handle request content types
  if (options.body instanceof FormData) {
    headers.delete("Content-Type")
  } else if (options.body instanceof URLSearchParams) {
    headers.set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    )
  } else if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  // Attach authentication token
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle API errors
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`

    try {
      const errorData = await response.json()
      const detail = errorData.detail

      if (typeof detail === "string") {
        errorMessage = detail
      } else if (Array.isArray(detail)) {
        errorMessage =
          detail
            .map((item: { msg?: string }) => item.msg ?? "")
            .filter(Boolean)
            .join(", ") || errorMessage
      }
    } catch {
      // Keep default error message
    }

    throw new ApiError(errorMessage, response.status)
  }

  // Return JSON responses
  const contentType = response.headers.get("content-type")

  if (contentType?.includes("application/json")) {
    return response.json()
  }

  return response
}

// const API_BASE_URL = "http://127.0.0.1:8001"

// export async function apiRequest(
//   endpoint: string,
//   options: RequestInit = {}
// ) {
//   const token = localStorage.getItem("access_token")

//   const headers = new Headers(options.headers)

//   if (!(options.body instanceof FormData)) {
//     headers.set("Content-Type", "application/json")
//   }

//   if (token) {
//     headers.set("Authorization", `Bearer ${token}`)
//   }

//   const response = await fetch(
//     `${API_BASE_URL}${endpoint}`,
//     {
//       ...options,
//       headers,
//     }
//   )

//   if (!response.ok) {
//     let errorMessage = `Request failed: ${response.status}`

//     try {
//       const errorData = await response.json()

//       if (errorData.detail) {
//         errorMessage = errorData.detail
//       }
//     } catch {
//       // ignore JSON parsing error
//     }

//     throw new Error(errorMessage)
//   }

//   const contentType = response.headers.get("content-type")

//   if (contentType?.includes("application/json")) {
//     return response.json()
//   }

//   return response
// }