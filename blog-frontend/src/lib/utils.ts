import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use regex
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
  // Client-side: use DOM
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function getPlainTextExcerpt(excerpt: string, maxLength: number = 200): string {
  const plainText = stripHtml(excerpt);
  return truncate(plainText, maxLength);
}
