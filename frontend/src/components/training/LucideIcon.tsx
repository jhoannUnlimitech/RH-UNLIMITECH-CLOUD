import {
  BookOpen, Clipboard, FileText, Bot, Book, GraduationCap,
  Shield, Lightbulb, Wrench, BarChart3, Building, Zap,
  Folder, Star, Rocket, Crown, Flame, Target,
  type LucideIcon
} from "lucide-react";

/**
 * LucideIcon — Renderiza un ícono Lucide por nombre (string).
 *
 * Mapea el nombre almacenado en DB al componente React correspondiente.
 * Si el nombre no se reconoce (ej: es un emoji del seed viejo), muestra Folder.
 */

const ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "clipboard": Clipboard,
  "file-text": FileText,
  "bot": Bot,
  "book": Book,
  "graduation-cap": GraduationCap,
  "shield": Shield,
  "lightbulb": Lightbulb,
  "wrench": Wrench,
  "bar-chart": BarChart3,
  "building": Building,
  "zap": Zap,
  "folder": Folder,
  "star": Star,
  "rocket": Rocket,
  "crown": Crown,
  "flame": Flame,
  "target": Target,
};

interface LucideIconByNameProps {
  name?: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function LucideIconByName({ name, size = 16, className = "", color }: LucideIconByNameProps) {
  // Si no hay nombre o es un emoji (comienza con caracter no-ascii), usar Folder
  const isEmoji = name && /^[^\x00-\x7F]/.test(name);
  const Icon = (!name || isEmoji) ? Folder : (ICON_MAP[name] || Folder);

  return <Icon size={size} className={className} style={color ? { color } : undefined} />;
}
