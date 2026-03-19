import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:      string;
      role?:   string;
      status?: string;
      company?: { id: string };
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    role?:        string;
    status?:      string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?:               string;
    role?:             string;
    status?:           string;
    statusCheckedAt?:  number;
    accessToken?:      string;
    companyId?:        string;
  }
}
