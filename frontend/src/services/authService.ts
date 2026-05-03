import apiInstance from './apiService';
import { UserProfile } from '../types';

const CURRENT_USER_KEY = 'lms_current_user';

interface BackendUser {
  id: number;
  email: string;
  display_name: string;
  student_id?: string;
  role: 'admin' | 'reader';
  status?: 'active' | 'deleted';
  card_expiry?: number;
  created_at: number;
}

const normalizeUser = (user: BackendUser): UserProfile => ({
  id: user.id,
  uid: String(user.id),
  email: user.email,
  displayName: user.display_name,
  studentId: user.student_id || '',
  role: user.role === 'admin' ? 'admin' : 'reader',
  status: user.status === 'deleted' ? 'deleted' : 'active',
  cardExpiry: user.card_expiry ? Number(user.card_expiry) : undefined,
  createdAt: Number(user.created_at || Date.now()),
});

const saveCurrentUser = (user: UserProfile) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): UserProfile | null => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as UserProfile;
    if (typeof parsed.id === 'number') {
      return parsed;
    }

    const fallbackId = Number(parsed.uid);
    if (!Number.isNaN(fallbackId) && fallbackId > 0) {
      const migrated = { ...parsed, id: fallbackId };
      saveCurrentUser(migrated);
      return migrated;
    }

    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<UserProfile> => {
  const email = String(data.email || '').trim().toLowerCase();
  const password = String(data.password || '').trim();

  const response = await apiInstance.post('/users/login', {
    email,
    password,
  });

  const normalized = normalizeUser(response.data);
  saveCurrentUser(normalized);
  return normalized;
};

export const registerUser = async (data: {
  email: string;
  password: string;
  displayName: string;
  studentId: string;
}): Promise<UserProfile> => {
  const email = String(data.email || '').trim().toLowerCase();
  const password = String(data.password || '').trim();
  const displayName = String(data.displayName || '').trim();
  const studentId = String(data.studentId || '').trim();

  const response = await apiInstance.post('/users', {
    email,
    password,
    display_name: displayName,
    student_id: studentId,
    role: 'reader',
  });

  const normalized = normalizeUser(response.data);
  saveCurrentUser(normalized);
  return normalized;
};

export const updateUser = async (
  id: number,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const response = await apiInstance.put(`/users/${id}`, {
    email: data.email,
    display_name: data.displayName,
    student_id: data.studentId,
    role: data.role,
  });

  const normalized = normalizeUser(response.data);
  saveCurrentUser(normalized);
  return normalized;
};

export const syncCurrentUserFromApi = async (): Promise<UserProfile | null> => {
  const localUser = getCurrentUser();
  if (!localUser?.id) return localUser;

  try {
    const response = await apiInstance.get(`/users/${localUser.id}`);
    const normalized = normalizeUser(response.data);
    saveCurrentUser(normalized);
    return normalized;
  } catch {
    return localUser;
  }
};
