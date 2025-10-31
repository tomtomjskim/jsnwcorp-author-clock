# Author Clock (작가의 시계)

명언과 함께하는 시계 서비스

## 개요

실시간 시계와 함께 매일 새로운 명언을 제공하는 풀스택 웹 애플리케이션입니다. 저작권이 없는 공공 도메인 문학 작품의 명언을 수집하고 표시합니다.

## 기술 스택

### Frontend
- **Framework**: Vite 6.0 + React 18.3
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 15 (author_clock schema)
- **Cache**: Redis 7
- **ORM**: Direct pg library
- **Logging**: Winston

### Infrastructure
- **Container**: Docker multi-stage builds
- **Web Server**: Nginx (reverse proxy)
- **Base Image**: Alpine Linux
- **Network**: 172.20.0.15-16

## 주요 기능

### Phase 1 (MVP) - 구현 완료 ✅
- ⏰ 실시간 시계 표시
- 📖 오늘의 명언 (일일 고정)
- 🔄 명언 새로고침
- 🌓 다크/라이트 테마 전환
- 🖥️ 전체화면 모드
- 🌐 다국어 지원 (한국어/영어)
- ❤️ 좋아요 및 조회수 표시
- 💾 Redis 캐싱 (24시간)

## API 엔드포인트

- GET /api/quotes/today?language=ko - 오늘의 명언
- GET /api/quotes/random?language=ko - 랜덤 명언
- GET /api/health - Health check

## 배포 정보

- **Frontend**: http://203.245.30.6:3004
- **API**: http://203.245.30.6:3004/api
- **Memory**: API 96MB, Frontend 64MB
- **Status**: Active

## 개발자

- **Developer**: team-a
- **Date**: 2025-10-31
- **Version**: 1.0.0
