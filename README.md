# Multilingual Image Board (Next.js + Strapi)

> **배포 URL**: https://gcboard.obtuse.kr

> **관리자 패널 URL**: https://gcboardback.obtuse.kr/admin

## 📌 프로젝트 소개

Strapi와 Next.js 기반의 **다국어 이미지/갤러리 게시판**입니다. 한국어/영어/일본어 콘텐츠, 이미지 첨부, 커서 기반 무한 스크롤, 계층형 댓글 등 최신 웹 기술을 적용한 개인 프로젝트입니다.

- **개발 기간**: 2024.12.1 ~ 2024.12.17
- **개발 인원**: 1인 (개인 프로젝트)

---

## 🔍 개선 사항

### 기존 코드의 문제점

| 문제점                          | 개선 방법                                         |
| ------------------------------- | ------------------------------------------------- |
| 관리 기능 부재                  | 관리자/작성자 권한 분리, 게시글/댓글 관리 UI 구현 |
| 다국어 미지원                   | next-intl, Strapi i18n 플러그인 도입              |
| 댓글의 수정/삭제 기록 보존 안함 | 댓글 수정/삭제 이력 관리 및 논리 삭제 처리        |

### 개선 결과

**[관리 기능 부재 → 관리자/작성자 관리 기능 구현]**

- **개선 전**: 게시글/댓글 관리 UI 및 권한 분리 없음
- **개선 후**: 관리자/작성자 권한 분리, 게시글/댓글 관리 UI, 삭제/수정 제한 등 관리 기능 구현

**[다국어 미지원 → 다국어 지원**]

- **개선 전**: 언어별 콘텐츠 분리 불가
- **개선 후**: next-intl, Strapi i18n 플러그인으로 다국어 라우팅 및 번역, 언어별 게시글/메타데이터 관리

**[댓글의 수정/삭제 기록 보존 안함 → 댓글 이력 및 논리 삭제 처리]**

- **개선 전**: 댓글 수정/삭제 시 이력 및 상태 보존 불가, 대댓글이 없는 경우 즉시 물리적 삭제.
- **개선 후**: 댓글 수정/삭제 이력 필드 추가, 논리 삭제 및 복구, 삭제/수정 내역 관리

---

## ✨ 주요 기능

### 1. 사용자 인증

- 회원가입 / 로그인 / 로그아웃
- JWT 토큰 기반 인증 (NextAuth.js + Strapi)

### 2. 게시글 관리

- 게시글 CRUD (다국어 지원)
- 다중 이미지 첨부 및 썸네일
- 이미지 갤러리 뷰어 (라이트박스)

### 3. 댓글 기능

- 댓글 CRUD (계층형 구조, Path Model)
- **재귀적 삭제 및 논리 삭제**
- **무한 Depth 대댓글 지원**
- 무한 스크롤

---

## ⚡️ 적용 기술 심화: 무한 Depth 대댓글

### 구현 근거

본 프로젝트의 댓글 시스템은 **Strapi의 parent-child 관계**를 활용하여, 댓글과 대댓글을 트리 구조로 저장합니다. 각 댓글은 parent 필드를 통해 부모-자식 관계가 명확하게 관리됩니다. 이를 통해 **무한 Depth**의 대댓글(계층형 댓글)이 가능합니다.

구현 방식:

- 각 댓글에 `parent` 필드를 부여하여, 상위 댓글과의 관계를 정의합니다.
- 대댓글 조회 시, 특정 댓글의 모든 하위 댓글을 재귀적으로 탐색하여 계층 구조를 구성합니다.

### 기술적 이점

- **무한 Depth 지원**: 별도의 제한 없이 대댓글을 원하는 만큼 중첩할 수 있습니다.
- **유연한 관리**: 논리 삭제, 수정 이력 관리 등 계층형 구조에서 발생하는 다양한 요구사항을 유연하게 처리할 수 있습니다.
- **확장성**: 대규모 트리 구조에서도 성능 저하 없이 댓글 기능을 확장할 수 있습니다.

---

## 🛠️ 기술 스택

### Backend

- Next.js 16 (App Router)
- Strapi (Node.js CMS)
- JWT 인증, i18n 플러그인, Sharp

### Frontend

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS v4
- next-intl (i18n), react-dropzone, yet-another-react-lightbox
- React Hook Form + Zod

---

## 📂 프로젝트 구조

```
├── app/
│   ├── [locale]/
│   │   ├── (auth)/
│   │   └── posts/
│   └── api/
├── components/
│   ├── layout/
│   ├── posts/
│   ├── comments/
│   └── ui/
├── lib/
│   ├── api/
│   └── auth.ts
├── types/
├── messages/
├── public/
└── ...
```

---

## 🔗 API 명세

[swagger api docs 참조(관리자 계정 로그인 필요)](https://gcboardback.obtuse.kr/documentation/v1.0.0)

---

## 💻 로컬 실행 방법

### 1. 레포지토리 클론

```bash
git clone https://github.com/obtuse-triangle/backend-the-new-gc-board.git
cd backend-the-new-gc-board
```

### 2. 환경 변수 설정

```bash
cp env.example .env.local
# .env.local 파일에 STRAPI, NEXTAUTH 등 정보 입력
```

### 3. 의존성 설치 및 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎥 시연 영상

https://youtu.be/p9V1lEW2yWE

---

## 📚 참고 자료

- [Next.js Documentation](https://react.dev/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Strapi Documentation](https://strapi.io/documentation)
