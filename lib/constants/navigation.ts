import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Image,
  Users,
  Settings,
  Quote,
  Bell,
  HeartHandshake,
} from 'lucide-react'

/**
 * Navigation items for the admin panel.
 * Centralized here to avoid duplication and ease maintenance.
 */
export const ADMIN_MENU_ITEMS = [
  { href: '/admin/dashboard',          label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/admin/versiculo-destaque', label: 'Versículo Destaque', icon: Quote },
  { href: '/admin/eventos',            label: 'Eventos',            icon: Calendar },
  { href: '/admin/estudos',            label: 'Estudos',            icon: BookOpen },
  { href: '/admin/galeria',            label: 'Galeria',            icon: Image },
  { href: '/admin/equipe',             label: 'Equipe Pastoral',    icon: Users },
  { href: '/admin/avisos',             label: 'Mural de Avisos',    icon: Bell },
  { href: '/admin/oracao',             label: 'Pedidos de Oração',  icon: HeartHandshake },
  { href: '/admin/configuracoes',      label: 'Configurações',      icon: Settings },
] as const
