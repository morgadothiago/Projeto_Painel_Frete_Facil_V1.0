import { publicApi, getErrorMessage } from "@/lib/api"

export type LoginResponse = {
  access_token: string
  user: {
    id: string
    name: string
    email: string
    role: string
    status: string
  }
}

export type LoginError = {
  error: string
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse | LoginError | null> {
  if (!email || password.length < 6) {
    return { error: "E-mail ou senha inválidos." }
  }

  try {
    const { data } = await publicApi.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    })
    return data
  } catch (err) {
    return { error: getErrorMessage(err) }
  }
}
