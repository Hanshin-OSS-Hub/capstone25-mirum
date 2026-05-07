# 🚀 MIRUM Frontend

대학생 협업 프로젝트 관리 도구 **MIRUM**의 프론트엔드 저장소입니다.

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Core** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white) | SPA 라이브러리·번들러·클라이언트 라우팅 |
| **HTTP** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | REST 호출 · 공통 인스턴스·인터셉터 (`src/api/client.js`) |
| **State** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white) | 서버 상태 관리 (Caching, Refetching) |
| **Mocking** | ![MSW](https://img.shields.io/badge/MSW-FF6A33?style=flat-square&logo=mockserviceworker&logoColor=white) | API 모킹 및 네트워크 요청 가로채기 |
| **Type** | ![JSDoc](https://img.shields.io/badge/JSDoc-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | TypeScript 없이 타입 정보·DTO 정리 (`src/types/` 등) |
| **UI** | ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white) | New York · JSX · `components.json` · 재사용 컴포넌트 (`src/shared/components/ui/`) |
| **Style** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | 유틸리티 CSS · `tailwind.config.cjs` · 전역 `src/index.css` |
| **Lint/Format**| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black) | 코드 품질 검사 및 포맷 자동화 (`eslint.config.js`) |

## 🚀 설치 및 실행 (Getting Started)

```bash
# 1. 저장소 클론
git clone https://github.com/Hanshin-OSS-Hub/capstone25-mirum.git

# 2. 프론트엔드 디렉터리에서 의존성 설치
cd frontend
npm install

# 3. 개발 서버 실행 (Mock API 자동 활성화)
npm run dev
```

## 📂 폴더 구조 (Project Structure)

저장소 기준 `frontend/` (구조상 **mirum-frontend**에 해당)입니다.

```
mirum-frontend/
├── public/                      # 정적 자산 · MSW Service Worker 등
├── src/
│   ├── api/                     # Axios 공통 클라이언트 (`client.js`)
│   ├── constants/               # 도메인 상수 (역할·태스크 상태·파일 타입 등)
│   ├── features/                # 도메인별 기능 (api · components · hooks · utils)
│   │   ├── ai/                  # 리포트·차트·어시스턴트 패널
│   │   ├── auth/                # 로그인·회원가입·프로필·AuthContext
│   │   ├── chat/                # 태스크 채팅
│   │   ├── files/               # 프로젝트 파일 · 업로드
│   │   ├── invitations/         # 받은 초대 · 수락/거절
│   │   ├── members/             # 멤버 · 초대 모달
│   │   ├── note/                # 태스크 노트
│   │   ├── projects/            # 프로젝트 CRUD · 설정 패널
│   │   └── tasks/               # 태스크 · 타임라인 · 에디터
│   ├── mocks/                   # MSW
│   │   ├── browser.js
│   │   ├── handlers.js
│   │   └── domains/
│   │       ├── api/             # 도메인별 Mock 핸들러
│   │       ├── model/           # 인메모리 목 데이터
│   │       └── common.js
│   ├── pages/                   # 라우트 단위 페이지 (Landing 등)
│   ├── shared/                  # 앱 전역 UI · 훅 · 유틸
│   │   ├── assets/              # 아이콘 래퍼 등
│   │   ├── components/        # 레이아웃·히어로 · 하위 ui/
│   │   │   └── ui/              # shadcn/ui 스타일 프리미티브 (Button, Dialog …)
│   │   ├── hooks/
│   │   └── lib/                 # cn 등 공통 유틸
│   ├── types/                   # JSDoc `@typedef` · DTO
│   ├── utils/                   # 라우트 가드·알림·에러 메시지
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── components.json              # shadcn/ui 별칭 (`@/shared/...`)
├── eslint.config.js
├── tailwind.config.cjs
├── postcss.config.js
├── vite.config.js
├── jsconfig.json                # `@/` → `src/`
├── package.json
└── README.md
```

## 🏗️ 아키텍처 및 설계 철학 (Architecture & Design)

### 1. Feature-based Architecture (vs FSD)
본 프로젝트는 `기능 기반 아키텍처(Feature-based Architecture)`를 채택했습니다.
- **구조:** `src/features/{domain}/` 아래에 해당 도메인과 관련된 API 훅(TanStack Query), 컴포넌트, 유틸을 응집합니다.
- **선택 이유:**
    - `FSD(Feature-Sliced Design)`는 대규모 프로젝트에서 강력한 확장성을 제공하지만, 초기 설정 비용이 높고 계층 간 규칙이 엄격하여 진입 장벽이 있습니다.
    - 현재 프로젝트 규모와 팀의 개발 속도를 고려했을 때, **도메인별 응집도**를 높이면서도 **구조가 직관적**인 Feature-based 방식이 유지보수성과 생산성 측면에서 더 효율적이라고 판단했습니다.
- **참고**
    - https://joong-sunny.github.io/react/react7/

### 2. HTTP & UI 레이어
- **Axios:** 모든 API 요청은 `src/api/client.js`의 공통 인스턴스를 경유해 베이스 URL·헤더·에러 처리를 한곳에서 맞춥니다.
- **shadcn/ui:** 디자인 토큰에 맞춘 버튼·다이얼로그 등은 `shared/components/ui`에 두고, 도메인 화면은 이를 조합합니다.

### 3. Mocking First Development
백엔드 의존성을 제거하기 위해 **MSW**를 고도화했습니다.
- **도메인 분리:** `mocks/domains/model`의 인메모리 데이터와 `mocks/domains/api` 핸들러로 시나리오를 나눕니다.
- **handlers.js:** 핸들러를 한곳에서 등록해 부팅 시 주입합니다.

### 4. Server State Management
복잡한 비동기 상태 관리를 위해 **TanStack Query**를 도입했습니다.
- **Custom Hooks:** `useGetProjectList`, `useCreateProject` 등 도메인별 커스텀 훅으로 로직 분리.
- **Auto Refetch:** 데이터 변경(Mutation) 시 관련된 쿼리를 자동으로 무효화(Invalidate)하여 UI 동기화.

### 5. Type Safety without TypeScript
진입 장벽을 낮추면서도 안정성을 확보하기 위해 **JSDoc**을 활용했습니다.
- **DTO 정의:** 백엔드 API 명세에 맞춘 타입 정의(`@typedef`)를 통해 자동완성 및 타입 검사 지원.

## 📝 개발 문서 (Documentation)
더 자세한 기술적 내용과 개발 과정은 아래 문서에서 확인할 수 있습니다.
- [DOC_MSW.md](https://github.com/Hanshin-OSS-Hub/capstone25-mirum/wiki/DOC_MSW): Mock API 구현 상세 및 테스트 시나리오.
- [DOC_TANSTACK_QUERY.md](https://github.com/Hanshin-OSS-Hub/capstone25-mirum/wiki/DOC_TANSTACK_QUERY.md): 서버 상태 관리 전략.
- [DOC_JSDOC_TYPE_SYSTEM.md](https://github.com/Hanshin-OSS-Hub/capstone25-mirum/wiki/DOC_JSDOC_TYPE_SYSTEM.md): JSDoc 타입 시스템 도입 가이드.
