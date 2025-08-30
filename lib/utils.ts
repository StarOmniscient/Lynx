import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function currentBotMode() {
  return process.argv.slice(2).includes("--dev") ? "development" : "production"
}