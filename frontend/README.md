# 🚀 MIRUM Frontend

대학생 협업 프로젝트 관리 도구 **MIRUM**의 프론트엔드 저장소입니다.

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Core** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | UI 라이브러리 및 빌드 도구 |
| **State** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white) | 서버 상태 관리 (Caching, Refetching) |
| **Mocking** | ![MSW](https://img.shields.io/badge/MSW-FF6A33?style=flat-square&logo=mockserviceworker&logoColor=white) | API 모킹 및 네트워크 요청 가로채기 |
| **Type** | ![JSDoc](https://img.shields.io/badge/JSDoc-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | TypeScript 없는 타입 안전성 확보 |
| **Style** | ![CSS Modules](https://img.shields.io/badge/CSS_Modules-000000?style=flat-square&logo=cssmodules&logoColor=white) | 컴포넌트 단위 스타일링 |

## 🚀 설치 및 실행 (Getting Started)

```bash
# 1. 저장소 클론
git clone https://github.com/Hanshin-OSS-Hub/capstone25-mirum.git

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행 (Mock API 자동 활성화)
npm run dev
```

## 📂 폴더 구조 (Project Structure)

```
mirum-frontend/
├── public/            # 정적 파일 (favicon 등)
├── src/
│   ├── features/      # 도메인별 기능 모듈 (auth, projects, members...)
│   │   ├── api/       # TanStack Query 훅 (useQuery, useMutation)
│   │   ├── components/# 해당 도메인 전용 컴포넌트
│   │   └── types/     # JSDoc 타입 정의 (DTO)
│   ├── mocks/         # MSW 관련 파일 (Backendless 환경)
│   │   ├── api/       # 도메인별 Mock 핸들러 (auth.js, project.js...)
│   │   ├── data/      # 초기 JSON 데이터
│   │   ├── database.js# In-Memory Mock DB (Singleton)
│   │   └── handlers.js# 핸들러 통합
│   ├── pages/         # 라우트 페이지 (Home, Project...)
│   ├── shared/        # 공통 컴포넌트 및 유틸리티
│   ├── App.jsx        # 메인 앱 컴포넌트
│   └── main.jsx       # 진입점 (Entry Point)
├── .eslintrc.cjs      # ESLint 설정
├── .gitignore         # Git 제외 파일 목록
├── index.html         # HTML 템플릿
├── jsconfig.json      # JavaScript 설정 (절대 경로 등)
├── package.json       # 의존성 및 스크립트 관리
├── vite.config.js     # Vite 설정 (Proxy, Alias 등)
└── README.md          # 프로젝트 문서
```

## 🏗️ 아키텍처 및 설계 철학 (Architecture & Design)

### 1. Feature-based Architecture (vs FSD)
본 프로젝트는 `기능 기반 아키텍처(Feature-based Architecture)`를 채택했습니다.
- **구조:** `src/features/{domain}/` 아래에 해당 도메인과 관련된 API, 컴포넌트, 타입을 모두 응집시킵니다.
- **선택 이유:**
    - `FSD(Feature-Sliced Design)`는 대규모 프로젝트에서 강력한 확장성을 제공하지만, 초기 설정 비용이 높고 계층 간 규칙이 엄격하여 진입 장벽이 있습니다.
    - 현재 프로젝트 규모와 팀의 개발 속도를 고려했을 때, **도메인별 응집도**를 높이면서도 **구조가 직관적**인 Feature-based 방식이 유지보수성과 생산성 측면에서 더 효율적이라고 판단했습니다.

### 2. Mocking First Development
백엔드 의존성을 제거하기 위해 **MSW**를 고도화했습니다.
- **Centralized Mock DB:** `database.js`를 싱글톤으로 활용하여 핸들러 간 데이터 동기화(Sync) 문제 해결.
- **Realistic Logic:** 실제 백엔드와 유사한 비즈니스 로직(Cascade Delete, Constraint Check 등)을 Mock 핸들러에 구현.

### 3. Server State Management
복잡한 비동기 상태 관리를 위해 **TanStack Query**를 도입했습니다.
- **Custom Hooks:** `useGetProjectList`, `useCreateProject` 등 도메인별 커스텀 훅으로 로직 분리.
- **Auto Refetch:** 데이터 변경(Mutation) 시 관련된 쿼리를 자동으로 무효화(Invalidate)하여 UI 동기화.

### 4. Type Safety without TypeScript
진입 장벽을 낮추면서도 안정성을 확보하기 위해 **JSDoc**을 활용했습니다.
- **DTO 정의:** 백엔드 API 명세에 맞춘 타입 정의(`@typedef`)를 통해 자동완성 및 타입 검사 지원.

## 📝 개발 문서 (Documentation)
더 자세한 기술적 내용과 개발 과정은 아래 문서에서 확인할 수 있습니다.
- [DOC_MSW.md](./wiki/DOC_MSW.md): Mock API 구현 상세 및 테스트 시나리오.
- [DOC_TANSTACK_QUERY.md](./wiki/DOC_TANSTACK_QUERY.md): 서버 상태 관리 전략.
- [DOC_JSDOC_TYPE_SYSTEM.md](./wiki/DOC_JSDOC_TYPE_SYSTEM.md): JSDoc 타입 시스템 도입 가이드.
