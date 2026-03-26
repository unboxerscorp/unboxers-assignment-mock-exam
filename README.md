# Unboxers Assignment Mock Exam

## 과제 개요

이번 과제는 베이스 수학학원에서 약 **18-27인치의 터치스크린**을 이용해 시험을 응시하는 **모의고사 웹앱**을 만드는 과제입니다. 모의고사는 학생들이 지면에 문제를 풀고 답안을 앱으로 마킹하여 채점과 결과 확인, 이후 복습까지 온라인으로 진행되는 방식입니다.

현재 사용 중인 웹앱 일부는 [베이스 수학학원 데모](https://edu.basemath.co.kr/demo/exam) 에서 확인할 수 있습니다.

![2026년 3월 1일 공통수학1 진단고사 응시 현장](./img.jpg)
_2026년 3월 1일 공통수학1 진단고사 응시 현장_

## 기능 명세

모의고사 앱은 크게 세 단계로 구성됩니다.

1. 튜토리얼: 시험 응시에 대한 정보와 OMR 카드 작성 방법을 안내합니다.
2. 답안지 마킹: 시험 답안을 OMR 카드에 입력하고, 남은 시간 등을 표시합니다.
3. 채점 및 결과 확인: 답안을 제출하고 결과를 확인합니다.

## 과제 진행 방식

- 공유받은 Figma 디자인 파일을 참고해 모의고사 응시 웹앱을 자유롭게 개발합니다.
- Figma에 포함되지 않은 디테일은 구현자가 판단해 결정합니다.
- 필요하다면 [베이스 수학학원 데모](https://edu.basemath.co.kr/demo/exam)를 참고해도 됩니다.
- 과제 제출 방식은 자유입니다.

## 사용하는 기술

- 프론트엔드는 [React + Vite](https://vite.dev/guide/) 템플릿 기준입니다.
- 패키지 관리는 [pnpm](https://pnpm.io/)을 사용합니다.
- 스타일링은 [Tailwind CSS v4](https://tailwindcss.com/)를 사용합니다.
- 데이터 관리는 [TanStack Query](https://tanstack.com/query/latest)를 사용합니다.
- 그 외 스택은 자유롭게 선택할 수 있습니다.

## 서버 개요

과제용 모의고사 서버입니다. 현재 구성은 `Fastify + Prisma + SQLite`이며, API는 시험 조회와 시험 제출/채점 두 개만 제공합니다.

## 실행 방법

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

- 서버 주소: `http://localhost:3001`
- Swagger UI: `http://localhost:3001/swagger`
- 환경 변수 파일: `apps/server/.env`

## API

### `GET /api/exams`

시험 기본 정보를 조회합니다.

#### Response

```json
{
  "message": "Exam retrieved successfully",
  "data": {
    "title": "모의고사 응시 테스트",
    "description": "모의고사 웹앱 과제용으로 구성한 시험입니다.",
    "supervisorName": "배이수",
    "totalQuestions": 25,
    "totalScore": 100
  }
}
```

### `POST /api/exams/submit`

학생 정보와 답안을 제출하면 서버가 채점 후 결과를 반환합니다.

#### Request

```json
{
  "name": "홍길동",
  "school": "베이스고",
  "grade": 1,
  "studentNumber": 12,
  "seatNumber": 3,
  "answers": []
}
```

#### Request Field

- `name`: 학생 이름
- `school`: 학교명
- `grade`: 학년
- `studentNumber`: 번호
- `seatNumber`: 좌석 번호
- `answers`: 빈 배열도 허용하며, 아무 답안도 제출하지 않으면 전체 문항이 `unanswered`로 채점됨
- `answers`: 같은 `answerType`과 `number` 조합으로 2개 이상 제출하면 해당 문항은 오답 처리되며 결과 상태가 `duplicated`로 반환됨
- `answers[].answerType`: `objective` 또는 `subjective`
- `answers[].number`: 문항 번호
- `answers[].answer`: 제출 답안

#### Response

```json
{
  "message": "Exam submitted successfully",
  "data": {
    "title": "모의고사 응시 테스트",
    "score": 5,
    "correctCount": 2,
    "wrongCount": 0,
    "unansweredCount": 23,
    "results": [
      {
        "answerType": "objective",
        "number": 1,
        "result": "correct"
      },
      {
        "answerType": "subjective",
        "number": 1,
        "result": "correct"
      }
    ]
  }
}
```

#### Response Field

- `score`: 획득 점수
- `correctCount`: 정답 개수
- `wrongCount`: 오답 개수
- `unansweredCount`: 미응답 개수
- `results[].answerType`: `objective` 또는 `subjective`
- `results[].number`: 문항 번호
- `results[].result`: `correct`, `wrong`, `unanswered`, `duplicated`

#### Duplicate Answer Example

같은 문항에 대해 두 개 이상 답을 보내면 해당 문항은 `duplicated` 상태로 반환되며 오답으로 집계됩니다.

```json
{
  "name": "홍길동",
  "school": "베이스고",
  "grade": 1,
  "studentNumber": 12,
  "seatNumber": 3,
  "answers": [
    {
      "answerType": "objective",
      "number": 1,
      "answer": 3
    },
    {
      "answerType": "objective",
      "number": 1,
      "answer": 4
    }
  ]
}
```

```json
{
  "message": "Exam submitted successfully",
  "data": {
    "title": "모의고사 응시 테스트",
    "score": 0,
    "correctCount": 0,
    "wrongCount": 1,
    "unansweredCount": 24,
    "results": [
      {
        "answerType": "objective",
        "number": 1,
        "result": "duplicated"
      }
    ]
  }
}
```

## Seed 정답표

### 객관식

| 번호 | 정답 | 배점 |
| --- | --- | --- |
| 1 | 3 | 2 |
| 2 | 3 | 2 |
| 3 | 4 | 2.5 |
| 4 | 5 | 2.5 |
| 5 | 3 | 2.5 |
| 6 | 5 | 2.5 |
| 7 | 5 | 3 |
| 8 | 2 | 3 |
| 9 | 3 | 3.5 |
| 10 | 4 | 3.5 |
| 11 | 5 | 4 |
| 12 | 5 | 4 |
| 13 | 2 | 4.5 |
| 14 | 4 | 5.5 |

### 주관식

| 번호 | 정답 | 배점 |
| --- | --- | --- |
| 1 | 6 | 3 |
| 2 | 2 | 4 |
| 3 | 21 | 4 |
| 4 | 32 | 4 |
| 5 | 2 | 4 |
| 6 | 9 | 4.5 |
| 7 | 24 | 4.5 |
| 8 | 11 | 5 |
| 9 | 12 | 6 |
| 10 | 1 | 8 |
| 11 | 104 | 8 |

## 웹앱 실행 방법 요청

이 저장소를 포크한 뒤, 아래에 웹앱 실행 방법도 함께 작성해 주세요.

예시 형식:

- `## Web App Run`
- `pnpm install`
- `pnpm dev`
- 웹앱 실행 주소 기재
