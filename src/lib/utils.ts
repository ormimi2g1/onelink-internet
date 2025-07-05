import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: string = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
};

export const formatPhoneNumber = (phone: string) => {
  // Format Nigerian phone numbers
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('234')) {
    // +234 format
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.startsWith('0')) {
    // 0 format
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const validateNigerianPhone = (phone: string) => {
  const phoneRegex = /^(\+234|234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const calculateNextRenewalDate = (startDate: Date, planType: 'monthly' | 'yearly' = 'monthly') => {
  const renewal = new Date(startDate);
  if (planType === 'monthly') {
    renewal.setMonth(renewal.getMonth() + 1);
  } else {
    renewal.setFullYear(renewal.getFullYear() + 1);
  }
  return renewal;
};

export const getSpeedColor = (speed: number) => {
  if (speed >= 100) return 'text-green-600';
  if (speed >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'successful':
    case 'resolved':
      return 'text-green-600 bg-green-100';
    case 'pending':
    case 'in-progress':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
    case 'cancelled':
    case 'suspended':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
