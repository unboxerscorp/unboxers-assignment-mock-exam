import type { FastifyPluginAsync } from "fastify";
import { AnswerType } from "@prisma/client";
import { z } from "zod";

import { GRADE_RESULT } from "../lib/constants";
import { prisma } from "../lib/prisma";
import { errorResponse, successResponse } from "../lib/response";

const gradeAnswersSchema = z.object({
  name: z.string().trim().min(1),
  school: z.string().trim().min(1),
  grade: z.number().int(),
  studentNumber: z.number().int(),
  seatNumber: z.number().int(),
  answers: z
    .array(
      z.object({
        answerType: z.nativeEnum(AnswerType),
        number: z.number().int().positive(),
        answer: z.number().int()
      })
    )
});

function buildGradeResponse(
  exam: {
    title: string;
    questions: Array<{
      answerType: AnswerType;
      number: number;
      correctAnswer: number;
      score: number;
    }>;
  },
  rawAnswers: Array<{
    answerType: AnswerType;
    number: number;
    answer: number;
  }>
) {
  const answerMap = new Map<string, number>();
  const answerCountMap = new Map<string, number>();

  for (const rawAnswer of rawAnswers) {
    const answerKey = `${rawAnswer.answerType}:${rawAnswer.number}`;

    answerMap.set(answerKey, rawAnswer.answer);
    answerCountMap.set(answerKey, (answerCountMap.get(answerKey) ?? 0) + 1);
  }

  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const results = exam.questions.map((question) => {
    const answerKey = `${question.answerType}:${question.number}`;
    const submittedAnswer = answerMap.get(answerKey);
    const submittedAnswerCount = answerCountMap.get(answerKey) ?? 0;

    if (submittedAnswer == null) {
      unansweredCount += 1;
      return {
        answerType: question.answerType,
        number: question.number,
        result: GRADE_RESULT.UNANSWERED
      };
    }

    if (submittedAnswerCount > 1) {
      wrongCount += 1;
      return {
        answerType: question.answerType,
        number: question.number,
        result: GRADE_RESULT.DUPLICATED
      };
    }

    if (submittedAnswer === question.correctAnswer) {
      correctCount += 1;
      score += question.score;
      return {
        answerType: question.answerType,
        number: question.number,
        result: GRADE_RESULT.CORRECT
      };
    }

    wrongCount += 1;
    return {
      answerType: question.answerType,
      number: question.number,
      result: GRADE_RESULT.WRONG
    };
  });

  return {
    title: exam.title,
    score,
    correctCount,
    wrongCount,
    unansweredCount,
    results
  };
}

export const examsRoute: FastifyPluginAsync = async (app) => {
  app.get("/", async (_, reply) => {
    const exam = await prisma.exam.findFirst({
      include: {
        questions: {
          orderBy: [
            {
              answerType: "asc"
            },
            {
              number: "asc"
            }
          ],
          select: {
            score: true
          }
        }
      }
    });

    if (!exam) {
      return reply.code(404).send(errorResponse("Exam not found"));
    }

    const totalScore = exam.questions.reduce(
      (sum, question) => sum + question.score,
      0
    );

    return successResponse(
      "Exam retrieved successfully",
      {
        title: exam.title,
        description: exam.description,
        supervisorName: exam.supervisorName,
        totalQuestions: exam.questions.length,
        totalScore
      }
    );
  });

  app.post<{
    Body: unknown;
  }>("/submit", async (request, reply) => {
    const payload = gradeAnswersSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        ...errorResponse("Invalid request"),
        issues: payload.error.flatten()
      });
    }

    const exam = await prisma.exam.findFirst({
      include: {
        questions: {
          orderBy: [
            {
              answerType: "asc"
            },
            {
              number: "asc"
            }
          ],
          select: {
            answerType: true,
            number: true,
            correctAnswer: true,
            score: true
          }
        }
      }
    });

    if (!exam) {
      return reply.code(404).send(errorResponse("Exam not found"));
    }

    return successResponse(
      "Exam submitted successfully",
      buildGradeResponse(exam, payload.data.answers)
    );
  });
};
