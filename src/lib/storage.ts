/**
 * Enterprise Centralized LocalStorage Data Layer
 * Handles robust JSON serialization, default fallbacks, updates,
 * and window events for cross-component reactive updates.
 */

export const STORAGE_KEYS = {
  INITIALIZED: 'hrms_initialized',
  COMPANY: 'hrms_company',
  USER: 'hrms_user',
  EMPLOYEES: 'hrms_employees',
  DEPARTMENTS: 'hrms_departments',
  DESIGNATIONS: 'hrms_designations',
  BRANCHES: 'hrms_branches',
  ATTENDANCE: 'hrms_attendance',
  REGULARIZATIONS: 'hrms_regularizations',
  LEAVE_TYPES: 'hrms_leave_types',
  LEAVE_REQUESTS: 'hrms_leave_requests',
  HOLIDAYS: 'hrms_holidays',
  SHIFTS: 'hrms_shifts',
  SALARY_STRUCTURES: 'hrms_salary_structures',
  PAYROLL: 'hrms_payroll',
  PAYSLIPS: 'hrms_payslips',
  DOCUMENTS: 'hrms_documents',
  NOTIFICATIONS: 'hrms_notifications',
  AUDIT_LOGS: 'hrms_audit_logs',
  SETTINGS: 'hrms_settings',
  JOBS: 'hrms_jobs',
  CANDIDATES: 'hrms_candidates',
  ASSETS: 'hrms_assets',
  GOALS: 'hrms_goals',
  APPRAISALS: 'hrms_appraisals',
  ONBOARDING_CONFIG: 'hrms_onboarding_config',
  ONBOARDING_DOSSIERS: 'hrms_onboarding_dossiers',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// Custom event name for instant state sync across components
const HRMS_STORAGE_EVENT = 'hrms_storage_change';

// In-memory cache to avoid repeated synchronous JSON.parse/stringify on hot paths
const memoryCache = new Map<string, unknown>();
const pendingWrites = new Map<string, unknown>();
let writeScheduled = false;

function flushPendingWrites(): void {
  writeScheduled = false;
  pendingWrites.forEach((value, key) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[storage.set] Error writing key "${key}":`, error);
    }
  });
  pendingWrites.clear();
}

function scheduleFlush(): void {
  if (writeScheduled) return;
  writeScheduled = true;
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(
      flushPendingWrites,
      { timeout: 300 }
    );
  } else {
    setTimeout(flushPendingWrites, 0);
  }
}

function get<T>(key: string, defaultValue: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    const parsed = JSON.parse(item) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch (error) {
    console.warn(`[storage.get] Error reading key "${key}":`, error);
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  pendingWrites.set(key, value);
  scheduleFlush();
  try {
    // Dispatch custom window event so all reactive hooks update
    window.dispatchEvent(
      new CustomEvent(HRMS_STORAGE_EVENT, {
        detail: { key, value },
      })
    );
  } catch (error) {
    console.error(`[storage.set] Error dispatching event for key "${key}":`, error);
  }
}

function update<T>(key: string, updater: (prev: T) => T, defaultValue: T): T {
  const current = get<T>(key, defaultValue);
  const updated = updater(current);
  set<T>(key, updated);
  return updated;
}

function remove(key: string): void {
  memoryCache.delete(key);
  pendingWrites.delete(key);
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent(HRMS_STORAGE_EVENT, {
        detail: { key, value: null },
      })
    );
  } catch (error) {
    console.error(`[storage.remove] Error removing key "${key}":`, error);
  }
}

function clear(): void {
  memoryCache.clear();
  pendingWrites.clear();
  try {
    localStorage.clear();
    window.dispatchEvent(
      new CustomEvent(HRMS_STORAGE_EVENT, {
        detail: { key: '*', value: null },
      })
    );
  } catch (error) {
    console.error('[storage.clear] Error clearing localStorage:', error);
  }
}

function subscribe(callback: (event: { key: string; value: any }) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ key: string; value: any }>;
    callback(customEvent.detail);
  };
  window.addEventListener(HRMS_STORAGE_EVENT, handler);
  return () => window.removeEventListener(HRMS_STORAGE_EVENT, handler);
}

export const storage = {
  get,
  set,
  update,
  remove,
  clear,
  subscribe,
};
