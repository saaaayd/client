import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, StudentProfile } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<any>;
  setSessionFromOauth: (token: string, apiUser: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'dormsync_session';

function mapApiUser(apiUser: any): User {
  let studentProfile: StudentProfile | undefined;

  if (apiUser?.student_profile) {
    const sp = apiUser.student_profile;
    studentProfile = {
      id: sp.id,
      userId: sp.user_id,
      roomId: sp.room_id,
      roomNumber: sp.room_number ?? sp.room?.code ?? '',
      phoneNumber: sp.phone_number,
      emergencyContactName: sp.emergency_contact_name,
      emergencyContactPhone: sp.emergency_contact_phone,
      enrollmentDate: sp.enrollment_date,
      status: sp.status,
    };
  }

  return {
    id: apiUser.id || apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    status: apiUser.status || 'approved', // Default to approved for existing users
    studentProfile: studentProfile,
  }
}

function persistSession(token: string, user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
      axios.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
    }
    setIsLoading(false);
  }, []);

  const setSession = (nextToken: string, apiUser: any) => {
    const mapped = mapApiUser(apiUser);
    setUser(mapped);
    setToken(nextToken);
    persistSession(nextToken, mapped);
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email: identifier, password });
      // Backend returns flat object: { _id, name, email, role, token }
      setSession(res.data.token, res.data);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/google', { token: credential });

      // If status is pending, backend returns 201 but we shouldn't set session if no token
      if (res.data.status === 'pending') {
        // We can return the response data to the caller to handle redirect
        return res.data;
      }

      setSession(res.data.token, res.data);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const setSessionFromOauth = (nextToken: string, apiUser: any) => {
    setSession(nextToken, apiUser);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common.Authorization;
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, googleLogin, setSessionFromOauth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
