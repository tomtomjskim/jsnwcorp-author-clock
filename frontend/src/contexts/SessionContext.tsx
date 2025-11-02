import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const SESSION_STORAGE_KEY = 'author-clock-session';

interface SessionContextType {
  sessionId: string;
  isReady: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * UUID v4 생성 함수 (브라우저 호환)
 * crypto.randomUUID()가 지원되지 않는 환경(HTTP)을 위한 폴백
 */
function generateUUID(): string {
  // crypto.randomUUID() 사용 가능 시 (HTTPS 또는 localhost)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 폴백: 수동 UUID v4 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 익명 세션 관리 Provider
 * UUID 기반 세션 ID를 생성하고 localStorage에 저장
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // localStorage에서 기존 세션 ID 로드
    let storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!storedSessionId) {
      // 새로운 세션 ID 생성 (UUID v4)
      storedSessionId = generateUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
      console.log('[Session] New session created:', storedSessionId);
    } else {
      console.log('[Session] Existing session loaded:', storedSessionId);
    }

    setSessionId(storedSessionId);
    setIsReady(true);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId, isReady }}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * 세션 훅
 * @returns sessionId, isReady
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
