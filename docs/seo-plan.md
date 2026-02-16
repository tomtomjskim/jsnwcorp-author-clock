# Author Clock - SEO 구현 설계서

> 서브도메인: `clock.jsnetworkcorp.com` | 구조: Express + Vite/React | 우선순위: 3

## 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 메타 title | ❌ "frontend" | 부적절한 제네릭 타이틀 |
| 메타 description | ❌ 없음 | |
| Open Graph | ❌ 없음 | |
| Twitter Card | ❌ 없음 | |
| robots.txt | ❌ 없음 | |
| sitemap.xml | ❌ 없음 | |
| favicon | ⚠️ vite.svg | 기본 Vite 아이콘 |
| JSON-LD | ❌ 없음 | |
| 동적 라우팅 | ❌ 없음 | 명언별 개별 URL 없음 |
| 렌더링 | CSR Only | 크롤러가 명언 콘텐츠 못 봄 |
| SEO 점수 | 1/10 | |

## 핵심 과제

Author Clock의 최대 SEO 자산은 **명언 콘텐츠 DB**. 현재 SPA 구조에서는 이 콘텐츠가 검색엔진에 전혀 노출되지 않음.

### 해결 전략 (3단계)

| 단계 | 내용 | 효과 |
|------|------|------|
| 1차 | 메타태그 + robots + sitemap (기본) | 홈페이지 인덱싱 |
| 2차 | 명언 개별 페이지 + API 기반 메타태그 | 콘텐츠 인덱싱 |
| 3차 | 저자별/카테고리별 아카이브 페이지 | 롱테일 키워드 |

---

## 목표 키워드

| 페이지 | 주요 키워드 | 보조 키워드 |
|--------|-----------|-----------|
| / (메인) | 명언 시계, 오늘의 명언 | 문학 명언, 명언 모음, 작가 명언 |
| /quotes/:id | {저자명} 명언 | {출처} 명구, 문학 인용구 |
| /authors/:name | {저자명} 명언 모음 | {저자명} 어록, 인용구 |
| /daily | 오늘의 명언 | 매일 명언, 일일 명언 |

---

## 구현 항목

### 1. Frontend - index.html 메타태그 (즉시 적용)

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- 기본 SEO -->
  <title>Author Clock - 시간과 함께하는 명언</title>
  <meta name="description" content="매 순간 새로운 명언을 만나보세요. 세계 문학의 명구를 시간과 함께 감상하는 아름다운 시계." />
  <meta name="keywords" content="명언 시계, 오늘의 명언, 문학 명언, 작가 명언, 명언 모음, author clock" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Author Clock - 시간과 함께하는 명언" />
  <meta property="og:description" content="매 순간 새로운 명언을 만나보세요. 세계 문학의 명구를 시간과 함께 감상하는 아름다운 시계." />
  <meta property="og:image" content="https://clock.jsnetworkcorp.com/og/home.png" />
  <meta property="og:url" content="https://clock.jsnetworkcorp.com" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:site_name" content="Author Clock" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Author Clock - 시간과 함께하는 명언" />
  <meta name="twitter:description" content="매 순간 새로운 명언을 만나보세요." />
  <meta name="twitter:image" content="https://clock.jsnetworkcorp.com/og/home.png" />

  <!-- Canonical -->
  <link rel="canonical" href="https://clock.jsnetworkcorp.com" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <script type="module" src="/src/main.tsx"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### 2. JSON-LD 구조화 데이터

#### 2.1 WebApplication (메인 페이지)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Author Clock",
  "description": "시간과 함께하는 명언 시계",
  "url": "https://clock.jsnetworkcorp.com",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "KRW"
  },
  "inLanguage": ["ko", "en", "ja", "zh", "es", "fr", "de"],
  "author": {
    "@type": "Organization",
    "name": "Author Clock"
  }
}
```

#### 2.2 Quotation 스키마 (개별 명언 페이지 - 2차)
```json
{
  "@context": "https://schema.org",
  "@type": "Quotation",
  "text": "세상을 바꾸려면 먼저 자신을 바꿔야 한다",
  "creator": {
    "@type": "Person",
    "name": "간디"
  },
  "isPartOf": {
    "@type": "Book",
    "name": "모든 생물은 평등하다"
  },
  "inLanguage": "ko"
}
```

### 3. robots.txt

Frontend public/ 디렉토리에 추가:

```
User-agent: *
Allow: /
Allow: /quotes/
Allow: /authors/
Allow: /daily
Disallow: /api/
Sitemap: https://clock.jsnetworkcorp.com/sitemap.xml
```

### 4. sitemap.xml 전략

Author Clock의 sitemap은 **동적 생성**이 필요 (명언 DB 기반).

#### 4.1 Backend API 엔드포인트 추가
```typescript
// backend/src/routes/seo.ts (신규)
import { Router } from 'express';
import { pool } from '../config/database';

const router = Router();

// GET /api/sitemap - sitemap.xml 데이터 제공
router.get('/sitemap', async (req, res) => {
  const quotes = await pool.query(
    `SELECT id, updated_at FROM author_clock.quotes
     WHERE is_approved = true AND is_public_domain = true
     ORDER BY likes_count DESC LIMIT 500`
  );

  const authors = await pool.query(
    `SELECT DISTINCT author FROM author_clock.quotes
     WHERE is_approved = true`
  );

  res.json({ quotes: quotes.rows, authors: authors.rows });
});

export default router;
```

#### 4.2 빌드 타임 sitemap 생성 스크립트
```javascript
// scripts/generate-sitemap.mjs
const BASE_URL = 'https://clock.jsnetworkcorp.com';
const API_URL = 'http://172.20.0.16:3000';

async function generateSitemap() {
  const res = await fetch(`${API_URL}/api/sitemap`);
  const { quotes, authors } = await res.json();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/daily</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // 인기 명언 페이지
  for (const q of quotes) {
    xml += `
  <url>
    <loc>${BASE_URL}/quotes/${q.id}</loc>
    <lastmod>${q.updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  // 저자 페이지
  for (const a of authors) {
    xml += `
  <url>
    <loc>${BASE_URL}/authors/${encodeURIComponent(a.author)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  xml += '\n</urlset>';

  writeFileSync('./frontend/public/sitemap.xml', xml);
  console.log(`Generated sitemap with ${quotes.length} quotes and ${authors.length} authors`);
}

generateSitemap();
```

### 5. 동적 명언 페이지 (2차 단계)

현재 SPA에 React Router 추가하여 명언 개별 페이지 생성.

#### 5.1 라우트 구조
```
/ → 메인 시계 (기존)
/quotes/:id → 개별 명언 페이지 (신규)
/authors/:name → 저자별 명언 목록 (신규)
/daily → 오늘의 명언 (신규)
```

#### 5.2 Backend - SSR 메타태그 API

검색엔진 크롤러를 위해, backend에서 **명언별 HTML 메타태그를 동적으로 생성**:

```typescript
// backend/src/routes/seo.ts
// GET /api/seo/meta/:quoteId - 명언 메타태그 반환
router.get('/seo/meta/:quoteId', async (req, res) => {
  const { quoteId } = req.params;
  const result = await pool.query(
    `SELECT text, author, source FROM author_clock.quotes WHERE id = $1`,
    [quoteId]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

  const quote = result.rows[0];
  const title = `${quote.author}의 명언 - Author Clock`;
  const description = quote.text.slice(0, 160);

  res.json({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: `https://clock.jsnetworkcorp.com/quotes/${quoteId}`,
    author: quote.author,
    source: quote.source,
  });
});
```

#### 5.3 nginx - 크롤러 감지 + prerender

검색엔진 크롤러에게만 서버 렌더링된 HTML 제공:

```nginx
# clock.jsnetworkcorp.com server block
# 크롤러 감지 (User-Agent 기반)
set $prerender 0;
if ($http_user_agent ~* "googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator") {
    set $prerender 1;
}

# 크롤러이면 → prerender 서비스로
# 일반 사용자이면 → React SPA로
location /quotes/ {
    if ($prerender = 1) {
        # 백엔드의 SSR 엔드포인트로 프록시
        proxy_pass http://172.20.0.16:3000/api/seo/render$request_uri;
    }
    # SPA fallback
    try_files $uri /index.html;
}
```

**또는** 더 간단한 접근 - Backend에서 완전한 HTML 렌더링:

```typescript
// backend/src/routes/seo.ts
// GET /api/seo/render/quotes/:id - 크롤러용 HTML
router.get('/seo/render/quotes/:id', async (req, res) => {
  const quote = await getQuote(req.params.id);
  if (!quote) return res.status(404).send('Not found');

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <title>${quote.author}의 명언 - Author Clock</title>
  <meta name="description" content="${quote.text.slice(0, 160)}" />
  <meta property="og:title" content="${quote.author}의 명언 - Author Clock" />
  <meta property="og:description" content="${quote.text.slice(0, 160)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://clock.jsnetworkcorp.com/quotes/${quote.id}" />
  <link rel="canonical" href="https://clock.jsnetworkcorp.com/quotes/${quote.id}" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: quote.text,
    creator: { '@type': 'Person', name: quote.author },
    inLanguage: quote.language,
  })}</script>
</head>
<body>
  <article>
    <blockquote>${quote.text}</blockquote>
    <footer>- ${quote.author}${quote.source ? `, 『${quote.source}』` : ''}</footer>
  </article>
  <p><a href="https://clock.jsnetworkcorp.com">Author Clock에서 더 많은 명언 보기</a></p>
</body>
</html>`;

  res.type('html').send(html);
});
```

### 6. 다국어 SEO (3차 단계)

Author Clock은 7개 언어를 지원하므로, `hreflang` 태그를 활용:

```html
<link rel="alternate" hreflang="ko" href="https://clock.jsnetworkcorp.com/?lang=ko" />
<link rel="alternate" hreflang="en" href="https://clock.jsnetworkcorp.com/?lang=en" />
<link rel="alternate" hreflang="ja" href="https://clock.jsnetworkcorp.com/?lang=ja" />
<link rel="alternate" hreflang="zh" href="https://clock.jsnetworkcorp.com/?lang=zh" />
<link rel="alternate" hreflang="x-default" href="https://clock.jsnetworkcorp.com" />
```

### 7. 필요한 정적 파일

```
frontend/public/
├── favicon.svg           (수정 - 브랜드 아이콘으로)
├── apple-touch-icon.png  (신규, 180x180)
├── robots.txt            (신규)
├── sitemap.xml           (동적 생성)
├── og/
│   ├── home.png          (신규, 1200x630 - 시계+명언 비주얼)
│   └── quote-default.png (신규, 1200x630 - 명언 기본 OG)
```

---

## 파일 변경 요약

### 1차 (메타태그 기본)

| 파일 | 위치 | 작업 | 우선순위 |
|------|------|------|---------|
| `index.html` | frontend/ | 메타태그 전면 개선 | 🔴 필수 |
| `robots.txt` | frontend/public/ | 신규 생성 | 🔴 필수 |
| `sitemap.xml` | frontend/public/ | 정적 버전 우선 생성 | 🔴 필수 |
| `favicon.svg` | frontend/public/ | 브랜드 아이콘으로 교체 | 🟡 권장 |
| `og/home.png` | frontend/public/ | OG 이미지 디자인 | 🟡 권장 |

### 2차 (명언 개별 페이지)

| 파일 | 위치 | 작업 | 우선순위 |
|------|------|------|---------|
| `seo.ts` | backend/src/routes/ | SEO API 엔드포인트 (meta, render, sitemap) | 🔴 필수 |
| `index.ts` | backend/src/routes/ | SEO 라우트 등록 | 🔴 필수 |
| `App.tsx` | frontend/src/ | React Router 추가 | 🟡 권장 |
| `QuotePage.tsx` | frontend/src/pages/ | 개별 명언 페이지 컴포넌트 | 🟡 권장 |
| `DailyPage.tsx` | frontend/src/pages/ | 오늘의 명언 페이지 | 🟡 권장 |
| `AuthorPage.tsx` | frontend/src/pages/ | 저자별 명언 목록 | 🟢 선택 |
| `generate-sitemap.mjs` | scripts/ | 동적 sitemap 생성 스크립트 | 🟡 권장 |

### 3차 (다국어 + 아카이브)

| 파일 | 위치 | 작업 | 우선순위 |
|------|------|------|---------|
| `index.html` | frontend/ | hreflang 태그 추가 | 🟢 선택 |
| `ArchivePage.tsx` | frontend/src/pages/ | 날짜별 명언 아카이브 | 🟢 선택 |
| `CategoryPage.tsx` | frontend/src/pages/ | 카테고리별 명언 | 🟢 선택 |

---

## 검증 방법

### 메타태그 검증
```bash
curl -s https://clock.jsnetworkcorp.com | grep -E '<title|<meta'
```

### 크롤러 렌더링 테스트 (2차 후)
```bash
# Google Bot User-Agent로 요청
curl -A "Googlebot/2.1" https://clock.jsnetworkcorp.com/quotes/1
```

### 구조화 데이터 검증
- Google Rich Results Test
- Schema.org Validator

### sitemap 검증
```bash
curl https://clock.jsnetworkcorp.com/sitemap.xml
# XML 유효성 확인
```

---

## Author Clock SEO의 특별한 기회

1. **콘텐츠 자산**: DB에 저장된 모든 명언이 검색 가능한 페이지가 될 수 있음
2. **롱테일 키워드**: "{저자명} 명언"은 매우 구체적인 검색 키워드
3. **매일 새로운 콘텐츠**: daily_quotes 테이블을 통해 매일 새 콘텐츠 생성
4. **다국어**: 7개 언어 지원으로 글로벌 트래픽 가능
5. **인용 스키마**: Schema.org Quotation은 검색 결과에서 리치 스니펫으로 표시 가능

## 예상 효과

| 항목 | 현재 | 1차 후 | 2차 후 | 3차 후 |
|------|------|--------|--------|--------|
| SEO 점수 | 1/10 | 5/10 | 7/10 | 9/10 |
| 인덱싱 페이지 | 0 | 1 | 100+ | 500+ |
| 검색 키워드 | 0 | 3-5 | 50+ | 200+ |
| OG 미리보기 | ❌ | ✅ | ✅ | ✅ |
| 리치 스니펫 | ❌ | WebApp | Quotation | Quotation + hreflang |

## 구현 예상 시간
- 1차 (메타태그 + robots + sitemap): ~2시간
- 2차 (SEO API + 명언 페이지 + React Router): ~8시간
- 3차 (다국어 + 아카이브): ~5시간
- 이미지 디자인: ~2시간
- **총 예상: ~17시간**
