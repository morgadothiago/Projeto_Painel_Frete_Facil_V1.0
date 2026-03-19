import {
  LayoutDashboard,
  Truck,
  Building2,
  Wallet,
  Settings,
  Map,
  MapPin,
  ClipboardList,
  Car,
  Bell,
  UserCircle,
  TrendingUp,
  PackageSearch,
} from "lucide-react";

export type NavItem = {
  title: string;
  href:  string;
  icon:  React.ElementType;
  badge?: number;
};

export type NavGroup = {
  label?: string;
  items:  NavItem[];
};

// Itens por role — adicione/remova conforme as rotas crescerem
export const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  ADMIN: [
    {
      items: [
        { title: "Dashboard",      href: "/dashboard",                icon: LayoutDashboard },
      ],
    },
    {
      label: "Operacoes",
      items: [
        { title: "Fretes",           href: "/dashboard/fretes",       icon: Truck },
        { title: "Empresas",         href: "/dashboard/empresas",     icon: Building2 },
        { title: "Mapa",             href: "/dashboard/mapa",         icon: Map },
        { title: "Tipos de Veiculo", href: "/dashboard/veiculos",     icon: Car },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { title: "Faturamento",    href: "/dashboard/faturamento",    icon: Wallet },
        { title: "Relatorios",     href: "/dashboard/relatorios",     icon: TrendingUp },
      ],
    },
    {
      label: "Sistema",
      items: [
        { title: "Usuarios",       href: "/dashboard/usuarios",       icon: UserCircle },
        { title: "Notificacoes",   href: "/dashboard/notificacoes",   icon: Bell },
        { title: "Configuracoes",  href: "/dashboard/configuracoes",  icon: Settings },
      ],
    },
  ],

  COMPANY: [
    {
      items: [
        { title: "Dashboard",      href: "/dashboard",                icon: LayoutDashboard },
      ],
    },
    {
      label: "Fretes",
      items: [
        { title: "Meus Fretes",    href: "/dashboard/fretes",         icon: ClipboardList },
        { title: "Simular Frete",  href: "/dashboard/simular",        icon: MapPin },
        { title: "Rastrear",       href: "/dashboard/rastrear",       icon: Truck },
      ],
    },
    {
      label: "Conta",
      items: [
        { title: "Financeiro",     href: "/dashboard/financeiro",     icon: Wallet },
        { title: "Notificacoes",   href: "/dashboard/notificacoes",   icon: Bell },
        { title: "Meu Perfil",     href: "/dashboard/perfil",         icon: UserCircle },
      ],
    },
  ],

  DRIVER: [
    {
      items: [
        { title: "Dashboard",      href: "/dashboard",                icon: LayoutDashboard },
      ],
    },
    {
      label: "Fretes",
      items: [
        { title: "Disponiveis",    href: "/dashboard/disponiveis",    icon: PackageSearch },
        { title: "Meus Fretes",    href: "/dashboard/fretes",         icon: ClipboardList },
        { title: "Em andamento",   href: "/dashboard/em-andamento",   icon: Truck },
      ],
    },
    {
      label: "Conta",
      items: [
        { title: "Meu Saldo",      href: "/dashboard/saldo",          icon: Wallet },
        { title: "Notificacoes",   href: "/dashboard/notificacoes",   icon: Bell },
        { title: "Meu Perfil",     href: "/dashboard/perfil",         icon: UserCircle },
      ],
    },
  ],
};
