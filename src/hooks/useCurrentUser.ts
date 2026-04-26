import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '../dto/AuthDto.js';

export function useCurrentUser() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setUsername(null); return; }
    try {
      const { sub } = jwtDecode<JWTPayload>(token);
      setUsername(sub ?? null);
    } catch {
      setUsername(null);
    }
  }, []);

  return username;
}
