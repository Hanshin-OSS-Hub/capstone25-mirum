import { useEffect, useState } from 'react';
import { api } from '@/api/client.js';
import { AuthContext } from '../hooks/useAuth';

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    const nickname = localStorage.getItem('nickname');
    const email = localStorage.getItem('email');
    if (token && username) {
      token !== 'null' && username !== 'undefined'
        ? setIsAuthenticated(true)
        : setIsAuthenticated(false);
      // "null" 문자열을 null로 변환
      setUser({
        username,
        nickname: nickname && nickname !== 'null' ? nickname : null,
        email: email && email !== 'null' ? email : null,
      });
    }
  }, []);

  const login = async (userData) => {
    // localStorage에 저장 (null/undefined는 저장하지 않음)
    if (!userData?.accessToken || !userData?.refreshToken) return;

    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);

    try {
      // 토큰 저장 후, 유저 정보 조회
      const profile = await api.get('/user');

      if (!profile) {
        throw new Error('유저 정보 없음');
      }

      localStorage.setItem('username', profile.username);
      profile.nickname
        ? localStorage.setItem('nickname', profile.nickname)
        : localStorage.removeItem('nickname');
      profile.email
        ? localStorage.setItem('email', profile.email)
        : localStorage.removeItem('email');

      setIsAuthenticated(true);
      setUser({
        username: profile.username,
        nickname: profile.nickname || null,
        email: profile.email || null,
      });
    } catch (err) {
      console.error('유저 조회 실패', err);
      logout();
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    // localStorage 업데이트
    if (updatedData.nickname) {
      localStorage.setItem('nickname', updatedData.nickname);
    }
    if (updatedData.email) {
      localStorage.setItem('email', updatedData.email);
    }
    // state 업데이트
    setUser((prev) => ({
      ...prev,
      name: updatedData.name || prev.name,
      email: updatedData.email || prev.email,
    }));
  };

  const deleteUser = () => {
    // 상태 초기화만 담당
    logout();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}
