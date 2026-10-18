# 정일재 — Security, traced.

운영 사이트: https://iljae627-portfolio.vercel.app

공개 활동을 근거로 재구성한 반응형 보안 포트폴리오입니다. Vercel에 배포하는 **Next.js App Router** 프로젝트입니다.

## 시작

Node.js 22 이상에서 프로젝트 폴더를 열고 실행합니다. 별도 서비스 설정 없이도 포트폴리오, 프로젝트 상세, 전체 아카이브를 사용할 수 있습니다.

```powershell
npm ci
npm run dev
```

브라우저: http://localhost:3000

```powershell
npm test
npm run build
npm start
```

## 사용 기술과 실제 역할

| 기술       | 사용 위치                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| HTML5      | `app/layout.jsx`의 html/body, header/nav/main/section/article/footer 등 시맨틱 HTML을 React가 렌더링 |
| CSS        | `app/globals.css`: 레이아웃, 반응형, 접근성, 인쇄 및 모션 감소 설정                                  |
| JavaScript | `.js`, `.jsx`, `.mjs`: 검색, 필터, 페이지네이션, 입력 검증, API                                      |
| React      | 컴포넌트, 검색 및 필터 상태, 관리자 폼                                                               |
| Next.js    | App Router, 프로젝트 상세 SSG, 서버 컴포넌트, API Route Handler, 메타데이터 및 sitemap               |
| Auth       | Auth.js (next-auth v5) + GitHub OAuth, MongoDB 세션, 서버에서 관리자 GitHub 고유 ID 검사             |
| MongoDB    | `activities` 게시물, 인증의 users/sessions/accounts/verification_tokens 컬렉션                       |
| Vercel     | Next.js 기본 빌드 및 Node.js 서버 함수 배포                                                          |

## 페이지

- `/`: 소개, 대표 작업 6개, 분야별 필터, 분석 방식, 이력, 기술 글 및 연락처.
- `/work/[slug]`: 문제·접근 방법·결과·본인 역할·원문 근거.
- `/archive`: 기술 블로그 51건 + 네이버 101건 + 공개 저장소 17개. 키워드·출처·분야 필터, 페이지 이동.
- `/sources`: 출처와 수집 기준 및 표현 원칙.
- `/admin`: GitHub 로그인 및 새 활동 게시.
- `/api/activities`: 공개 조회 GET, 관리자 전용 게시 POST.
- `/api/auth/*`: Auth.js OAuth 및 세션 엔드포인트.

## Vercel 배포

1. 이 폴더의 소스를 새 GitHub 저장소에 올립니다. `node_modules`, `.next`, `.env.local`은 올리지 않습니다. 저장소: https://github.com/iljae627/portfolio-repo
2. Vercel의 Add New → Project에서 저장소를 가져옵니다. Framework: **Next.js**. Root Directory: 이 프로젝트의 `package.json`이 있는 폴더. Build Command: `npm run build`, Install Command: `npm ci`. Output Directory는 기본값을 유지합니다. 정적 export를 사용하면 인증·MongoDB API가 작동하지 않습니다.
3. 도메인을 확인하고 `NEXT_PUBLIC_SITE_URL=https://실제도메인`을 설정합니다. 공개 페이지만 사용할 때도 메타데이터·sitemap의 올바른 주소를 위해 필요합니다.
4. 다음 관리자 설정을 완료한 후 재배포합니다. Vercel 프로젝트가 이미 있다면 그 프로젝트의 Git 저장소·Root Directory를 확인해서 연결합니다.

### MongoDB Atlas

1. Atlas에서 데이터베이스를 생성하거나 기존 개발용 데이터베이스를 선택합니다.
2. 해당 DB에만 `readWrite` 권한을 가진 database user를 생성합니다.
3. Connect → Drivers에서 연결 문자열을 가져와 Vercel의 **서버 전용** `MONGODB_URI`에 저장합니다. 비밀번호를 저장소나 채팅에 넣지 않습니다.
4. Atlas Network Access에서 Vercel 함수가 연결할 수 있는 네트워크 정책을 설정합니다. 고정 아웃바운드 IP가 있으면 해당 범위만 허용합니다. 일반 서버리스 동적 IP 구성에서는 Atlas의 연결 안내와 조직 정책을 확인합니다.
5. `MONGODB_DB=iljae_portfolio`를 설정합니다. Atlas는 트랜잭션이 가능한 replica set이므로 Auth.js MongoDB adapter에 연결된 MongoClient를 전달하는 현재 구성을 유지합니다.

### GitHub OAuth

1. GitHub Settings → Developer settings → OAuth Apps → New OAuth App.
2. Homepage URL: `https://실제도메인`.
3. Authorization callback URL: **`https://실제도메인/api/auth/callback/github`**.
4. Client ID/Secret을 Vercel 환경변수에 저장합니다.
5. `ADMIN_GITHUB_ID`는 사용자명 `iljae627`이 아니라 GitHub의 **숫자 고유 ID**입니다. [공개 프로필 API](https://api.github.com/users/iljae627)의 `id`를 문자열로 입력합니다. 계정 이름이 같다는 이유로 권한을 부여하지 않습니다.
6. `AUTH_SECRET`은 32바이트 이상 난수로 직접 생성합니다. 예: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`.
7. `AUTH_URL=https://실제도메인`을 설정합니다. callback URL과 origin이 정확히 일치해야 합니다.

### 환경변수

| 이름                   | 값 / 용도                                   |
| ---------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | 공개 사이트 절대 URL. 빌드 전 설정          |
| `MONGODB_URI`          | Atlas 연결 문자열, 서버 전용                |
| `MONGODB_DB`           | `iljae_portfolio`                           |
| `AUTH_SECRET`          | 충분히 긴 난수, 서버 전용                   |
| `AUTH_URL`             | 로그인·게시가 일어나는 정확한 사이트 origin |
| `AUTH_GITHUB_ID`       | OAuth App Client ID                         |
| `AUTH_GITHUB_SECRET`   | OAuth App Client Secret, 서버 전용          |
| `ADMIN_GITHUB_ID`      | 소유자 GitHub 숫자 ID                       |

로컬에서는 `.env.example`을 `.env.local`로 복사해 값을 입력합니다. Development/Preview/Production은 별도로 설정하고 Preview에 운영 DB를 공유하지 않는 것을 권장합니다. Preview OAuth 검증은 고정 preview domain과 별도 OAuth App을 사용합니다. 비밀 값에 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.

Vercel CLI를 사용하는 경우, 로컬 파일을 덮어쓸 수 있으므로 기존 설정을 보존한 뒤 `vercel env pull .env.local`을 사용합니다. 환경변수 추가 후에는 다시 배포해야 합니다.

### DB 인덱스

`.env.local`에 연결 정보를 저장한 후 실행합니다.

```powershell
npm run db:indexes
npm run db:seed
```

activities ID, 공개 여부·날짜, OAuth 계정, 이메일, 세션 토큰 등에 인덱스를 생성하고 세션·인증 만료 데이터에 TTL 인덱스를 설정합니다. MongoDB adapter는 별도 SQL migration을 요구하지 않습니다.

## 활동 추가와 콘텐츠 수정

관리자 로그인 → 제목, 요약, 날짜, 분야, HTTPS 근거 URL, 태그 작성 → 활동 게시. 저장한 글은 MongoDB `activities`에 들어가고 공개 아카이브에 반영됩니다. 기본 169개 공개 기록은 `npm run db:seed`로 MongoDB에 가져왔습니다. `data/archive.json`은 DB 장애 시 스냅샷으로 사용되며, 동일 ID는 중복 표시하지 않습니다. DB가 없거나 읽기에 실패해도 이 기록은 표시됩니다.

- 대표 작업 및 이력: `lib/projects.js`.
- 소개 및 메인 구성: `app/page.jsx`.
- 전체 기록: `data/archive.json`.
- 수집 정보: `data/source-snapshot.json`.
- 색·레이아웃·반응형: `app/globals.css`.

Vercel Cron으로 매일 한국 시간 오전 9시대에 공개 기록을 자동 갱신합니다. 관리자에서 새 활동을 직접 게시할 수도 있습니다. 관리자 UI는 **추가 게시**를 지원하며 기존 스냅샷 편집·삭제 UI는 제공하지 않습니다.

## 검증

- Next.js 프로덕션 빌드 성공.
- 콘텐츠·입력·수집기 단위 테스트 14개 통과.
- 임시 로컬 MongoDB replica set + 합성 세션으로 인증·권한·입력·쓰기·조회·동기화 통합 검사 14개 통과.
- 브라우저: 개발 필터, 검색, 빈 검색 결과, 초기화, 페이지네이션, 모바일 메뉴 확인.
- 실제 운영 환경에서 GitHub OAuth 로그인 → 관리자 폼 → 활동 게시 → Atlas 저장 → 공개 아카이브 검색까지 검증했습니다. 기본 169건에 이번 포트폴리오 구축 기록 1건을 추가해 총 170건입니다.
- 운영 API의 비로그인 게시 401, 다른 Origin 게시 403, sitemap의 실제 도메인을 확인했습니다.
- GitHub main 브랜치에 push하면 연결된 Vercel 프로젝트가 자동 배포합니다. 환경변수는 Production에 설정되어 있으며 Preview 인증은 별도로 구성해야 합니다.

Google Fonts는 원격 스타일시트이며 연결 실패 시 시스템 폰트로 표시됩니다. 기본 포트폴리오의 콘텐츠 조회는 외부 블로그의 실시간 응답에 의존하지 않습니다.

## 자료 범위

2026-10-18 기준 공개 자료를 사용했습니다. 기술 블로그 51개 글 본문, 네이버 101개 글 본문, GitHub 17개 공개 저장소의 메타데이터와 주요 README, 기존 포트폴리오를 확인했습니다. 팀 성과와 개인 기여, 교육 실습과 신규 취약점 제보를 구분했습니다. 비공개 활동은 임의로 추가하지 않았습니다.

## 일일 자동 동기화

`vercel.json`의 `0 0 * * *`는 UTC 00:00, 한국 시간 오전 9시입니다. Hobby 플랜은 09:00~09:59 사이에 하루 한 번 실행됩니다. [Vercel Cron 공식 문서](https://vercel.com/docs/cron-jobs/usage-and-pricing)를 참고하세요.

- GitHub: 공개 저장소 목록과 이름·설명·언어·수정일. 커밋 하나를 별도 활동으로 만들지 않습니다.
- 깃블로그: 전체 검색 인덱스의 제목·날짜·분야·태그·요약·원문 링크.
- 네이버: 페이지별 전체 공개 목록 + RSS 요약. RSS에 없는 글은 제목·날짜·링크를 수집하며 기존 상세 요약은 보존합니다.
- 원문 삭제·비공개 전환을 자동 삭제로 반영하지 않습니다. 대표 작업 6개와 이력은 검토된 설명을 유지합니다.
- ID 기반 upsert, 저장소 remote ID로 이름 변경 추적, MongoDB 분산 잠금으로 중복 게시와 동시 실행을 방지합니다.
- 출처별 성공·실패와 마지막 성공 시각은 `/sources`에서 확인합니다. 일부 출처 실패 시 정상 출처는 갱신하고 이전 기록을 유지하며 다음 날 다시 확인합니다.
- 관리자 로그인 후 `/admin`의 **지금 동기화**로 즉시 실행할 수 있습니다.

Vercel Production에 충분히 긴 난수 `CRON_SECRET`을 Secret 타입으로 저장합니다. Vercel은 자동으로 Bearer 인증 헤더를 보냅니다. `/api/cron/sync` GET은 해당 키를 검증하며 POST는 같은 Origin의 관리자 세션만 허용합니다. 외부 주소나 계정을 요청 파라미터로 받지 않습니다. 키는 로그·Git·공개 응답에 포함하지 않습니다.

## 디자인

2026-10-19에 Apple·토스의 웹페이지를 참고해 흰색 배경, 블루 포인트, 중앙 정렬 소개, 둥근 카드, 읽기 편한 글자 위계로 개편했습니다. 실제 활동과 기능은 유지하며, 타사 로고·제품 이미지는 사용하지 않았습니다. 색과 여백은 `app/globals.css`, 카드 표지는 `components/ProjectVisual.jsx`에서 조정합니다.
