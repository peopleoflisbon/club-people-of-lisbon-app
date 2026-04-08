import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return format(date, 'EEE dd MMM · HH:mm');
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getYouTubeId(url: string): string | null {
  const regexes = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  if (!id) return '';
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function getConversationId(userA: string, userB: string): [string, string] {
  // Ensures consistent ordering (participant_a < participant_b)
  return userA < userB ? [userA, userB] : [userB, userA];
}

export const LISBON_NEIGHBORHOODS = [
  'Alfama',
  'Alcântara',
  'Arroios',
  'Avenidas Novas',
  'Bairro Alto',
  'Baixa',
  'Beato',
  'Belém',
  'Benfica',
  'Campo de Ourique',
  'Carnide',
  'Chiado',
  'Estrela',
  'Graça',
  'Intendente',
  'Lapa',
  'Lumiar',
  'Mouraria',
  'Parque das Nações',
  'Penha de França',
  'Príncipe Real',
  'Rato',
  'Santa Maria Maior',
  'Santos',
  'São Bento',
  'Telheiras',
  'Other',
];
