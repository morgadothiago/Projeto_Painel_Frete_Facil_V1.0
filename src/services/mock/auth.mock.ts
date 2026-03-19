// ─── MOCK de autenticação ─────────────────────────────────────────────────────
// Simula a resposta do backend. Remova quando a API estiver pronta.

export type LoginResponse = {
  access_token: string;
  user: {
    id:     string;
    name:   string;
    email:  string;
    role:   "ADMIN" | "COMPANY" | "DRIVER";
    status: string;
  };
};

const MOCK_USERS: Record<string, LoginResponse> = {
  "admin@fretefacil.com": {
    access_token: "mock-token-admin-xyz",
    user: { id: "1", name: "Admin FreteFácil", email: "admin@fretefacil.com", role: "ADMIN",   status: "ACTIVE" },
  },
  "empresa@fretefacil.com": {
    access_token: "mock-token-company-xyz",
    user: { id: "2", name: "Empresa Teste",   email: "empresa@fretefacil.com", role: "COMPANY", status: "ACTIVE" },
  },
  "motorista@fretefacil.com": {
    access_token: "mock-token-driver-xyz",
    user: { id: "3", name: "João Motorista",  email: "motorista@fretefacil.com", role: "DRIVER",  status: "ACTIVE" },
  },
};

export async function mockLogin(email: string, password: string): Promise<LoginResponse | null> {
  // Simula latência de rede
  await new Promise((r) => setTimeout(r, 600));

  const user = MOCK_USERS[email];

  // Qualquer senha serve no mock — troque para testar erros
  if (!user || password.length < 3) return null;

  return user;
}
