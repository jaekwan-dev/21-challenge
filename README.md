# 21-challenge 프로젝트

이 프로젝트는 프론트엔드(Next.js)와 백엔드(Node.js/Express)로 구성된 웹 애플리케이션입니다. 카카오 로그인 기능을 포함하고 있습니다.

## 🚀 기술 스택

### 프론트엔드 (frontend)
- **프레임워크**: Next.js (App Router)
- **UI 라이브러리**: React
- **스타일링**: Tailwind CSS, shadcn/ui
- **언어**: TypeScript

### 백엔드 (backend)
- **런타임**: Node.js
- **프레임워크**: Express
- **언어**: TypeScript
- **인증**: Kakao OAuth 2.0
- **기타**: `axios`, `cors`, `dotenv`

## ⚙️ 설정 및 실행 방법

### 1. 공통 설정

프로젝트 루트 디렉토리 (`21-challenge/`)에서 시작합니다.

#### `.env` 파일 설정 (backend)

`backend` 디렉토리 내에 `.env` 파일을 생성하고 다음 내용을 추가합니다.
`KAKAO_REST_API_KEY`는 카카오 개발자 센터에서 발급받은 REST API 키로 대체해야 합니다.
`KAKAO_REDIRECT_URI`는 **반드시 백엔드의 콜백 URL**이어야 합니다.

```dotenv
KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
KAKAO_REDIRECT_URI=http://localhost:8080/auth/kakao/callback
```

### 2. 백엔드 (backend)

`backend` 디렉토리로 이동하여 의존성을 설치하고 서버를 실행합니다.

```bash
cd backend
npm install
npm start
```
백엔드 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 (frontend)

`frontend` 디렉토리로 이동하여 의존성을 설치하고 개발 서버를 실행합니다.

```bash
cd frontend
npm install
npm run dev
```
프론트엔드 개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 🔑 카카오 로그인 설정 (필수)

카카오 로그인 기능을 사용하려면 카카오 개발자 센터에서 애플리케이션을 설정해야 합니다.

1.  **카카오 개발자 사이트 접속**: [https://developers.kakao.com/](https://developers.kakao.com/)
2.  **내 애플리케이션 선택**: 로그인 후 "내 애플리케이션"으로 이동하여 해당 애플리케이션을 선택합니다.
3.  **카카오 로그인 활성화**: 좌측 메뉴에서 "카카오 로그인"으로 이동하여 "활성화 설정"을 **ON**으로 변경합니다.
4.  **Redirect URI 등록**: 좌측 메뉴에서 "카카오 로그인" -> "Redirect URI"로 이동합니다.
    여기에 **반드시 백엔드의 콜백 URL**을 등록해야 합니다.

    ```
    http://localhost:8080/auth/kakao/callback
    ```
    **주의**: `http://localhost:3000/auth/kakao/callback`이 아닙니다. 카카오는 인가 코드를 백엔드로 보내야 백엔드가 토큰을 요청하고 사용자 정보를 가져올 수 있습니다.

## 🚀 애플리케이션 실행

1.  **백엔드 서버 실행**: `backend` 디렉토리에서 `npm start`
2.  **프론트엔드 개발 서버 실행**: `frontend` 디렉토리에서 `npm run dev`
3.  웹 브라우저에서 `http://localhost:3000/login`으로 접속하여 카카오 로그인 기능을 테스트합니다.
