import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateHealthId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
