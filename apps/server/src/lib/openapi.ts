export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Unboxers Assignment Mock Exam API",
    version: "1.0.0",
    description: "모의고사 웹앱 과제용 API 문서"
  },
  servers: [
    {
      url: "http://localhost:3001"
    }
  ],
  components: {
    schemas: {
      AnswerType: {
        type: "string",
        enum: ["objective", "subjective"]
      },
      GradeResult: {
        type: "string",
        enum: ["correct", "wrong", "unanswered", "duplicated"]
      },
      ExamData: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: {
            type: "string",
            nullable: true
          },
          supervisorName: { type: "string" },
          totalQuestions: { type: "integer" },
          totalScore: { type: "number" }
        },
        required: [
          "title",
          "description",
          "supervisorName",
          "totalQuestions",
          "totalScore"
        ]
      },
      ExamResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: {
            $ref: "#/components/schemas/ExamData"
          }
        },
        required: ["message", "data"]
      },
      SubmitRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          school: { type: "string" },
          grade: { type: "integer" },
          studentNumber: { type: "integer" },
          seatNumber: { type: "integer" },
          answers: {
            type: "array",
            example: [],
            items: {
              type: "object",
              example: {
                answerType: "objective",
                number: 1,
                answer: 3
              },
              properties: {
                answerType: {
                  $ref: "#/components/schemas/AnswerType"
                },
                number: {
                  type: "integer"
                },
                answer: {
                  type: "integer"
                }
              },
              required: ["answerType", "number", "answer"]
            }
          }
        },
        required: [
          "name",
          "school",
          "grade",
          "studentNumber",
          "seatNumber",
          "answers"
        ]
      },
      SubmitResultItem: {
        type: "object",
        example: {
          answerType: "objective",
          number: 1,
          result: "correct"
        },
        properties: {
          answerType: {
            $ref: "#/components/schemas/AnswerType"
          },
          number: {
            type: "integer"
          },
          result: {
            $ref: "#/components/schemas/GradeResult"
          }
        },
        required: ["answerType", "number", "result"]
      },
      SubmitResultData: {
        type: "object",
        properties: {
          title: { type: "string" },
          score: { type: "number" },
          correctCount: { type: "integer" },
          wrongCount: { type: "integer" },
          unansweredCount: { type: "integer" },
          results: {
            type: "array",
            items: {
              $ref: "#/components/schemas/SubmitResultItem"
            }
          }
        },
        required: [
          "title",
          "score",
          "correctCount",
          "wrongCount",
          "unansweredCount",
          "results"
        ]
      },
      SubmitResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: {
            $ref: "#/components/schemas/SubmitResultData"
          }
        },
        required: ["message", "data"]
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" }
        },
        required: ["message"]
      }
    }
  },
  paths: {
    "/api/exams": {
      get: {
        summary: "시험 조회",
        responses: {
          "200": {
            description: "시험 조회 성공",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ExamResponse"
                }
              }
            }
          },
          "404": {
            description: "시험 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/exams/submit": {
      post: {
        summary: "시험 제출 및 채점",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubmitRequest"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "제출 성공",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SubmitResponse"
                }
              }
            }
          },
          "400": {
            description: "잘못된 요청",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          "404": {
            description: "시험 없음",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  }
} as const;

export function renderSwaggerHtml() {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;
}
