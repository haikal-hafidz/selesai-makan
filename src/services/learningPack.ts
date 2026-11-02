import {
  LearningPack,
  LearningPackValidationResult,
  LearningClass,
  Chapter,
  Lesson,
  Quiz,
  ResourceItem,
  Assignment,
  LearningPackAssignment,
} from '../types';
import { storage } from './storage';

/**
 * Validates a JSON Learning Pack structure (Supports both v1.0 and expanded v1.1)
 */
export function validateLearningPack(rawJson: unknown): LearningPackValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unsupportedFeatures: string[] = [];

  if (!rawJson || typeof rawJson !== 'object') {
    return {
      isValid: false,
      schemaVersion: 'unknown',
      errors: ['Invalid JSON payload: root must be an object.'],
      warnings: [],
      unsupportedFeatures: [],
      summary: {
        classesCount: 0,
        chaptersCount: 0,
        lessonsCount: 0,
        exercisesCount: 0,
        assignmentsCount: 0,
        hasFinalProject: false,
        quizzesCount: 0,
        resourcesCount: 0,
      },
    };
  }

  const pack = rawJson as Partial<LearningPack>;

  // Detect Schema Version
  let schemaVersion: '1.0' | '1.1' | 'unknown' = 'unknown';
  if (!pack.schemaVersion) {
    schemaVersion = '1.0';
    warnings.push('No schemaVersion detected. Assuming backward-compatible version "1.0".');
  } else if (pack.schemaVersion === '1.0' || pack.schemaVersion === '1.1') {
    schemaVersion = pack.schemaVersion;
  } else {
    warnings.push(`Unrecognized schema version "${pack.schemaVersion}". Operating under adaptive fallback.`);
  }

  // Validate Class Object
  if (!pack.class || typeof pack.class !== 'object') {
    errors.push('Missing required "class" object with course metadata.');
  } else {
    if (!pack.class.title || typeof pack.class.title !== 'string' || !pack.class.title.trim()) {
      errors.push('Class "title" is required and cannot be empty.');
    }
    if (!pack.class.subject || typeof pack.class.subject !== 'string' || !pack.class.subject.trim()) {
      errors.push('Class "subject" is required and cannot be empty.');
    }
  }

  // Final project validation
  const hasFinalProject = Boolean(
    pack.finalProject || pack.class?.finalProject
  );

  // Validate Chapters & Lessons
  let chaptersCount = 0;
  let lessonsCount = 0;
  let exercisesCount = 0;
  let assignmentsCount = 0;
  let quizzesCount = 0;

  if (pack.assignments && Array.isArray(pack.assignments)) {
    assignmentsCount += pack.assignments.length;
    pack.assignments.forEach((a, idx) => validateAssignment(a, `Course assignment #${idx + 1}`, errors));
  }

  if (!pack.chapters || !Array.isArray(pack.chapters)) {
    errors.push('Missing required "chapters" array.');
  } else {
    chaptersCount = pack.chapters.length;
    if (chaptersCount === 0) {
      warnings.push('The package contains no chapters.');
    }

    pack.chapters.forEach((chapter, chIdx) => {
      const chapterLabel = chapter?.title ? `Chapter "${chapter.title}"` : `Chapter #${chIdx + 1}`;
      if (!chapter || typeof chapter !== 'object') {
        errors.push(`${chapterLabel} is not a valid object.`);
        return;
      }
      if (!chapter.title || typeof chapter.title !== 'string' || !chapter.title.trim()) {
        errors.push(`${chapterLabel} is missing a required title.`);
      }

      if (!chapter.lessons || !Array.isArray(chapter.lessons)) {
        warnings.push(`${chapterLabel} contains no lessons array.`);
      } else {
        chapter.lessons.forEach((lesson, lsIdx) => {
          lessonsCount++;
          const lessonLabel = lesson?.title ? `Lesson "${lesson.title}"` : `Lesson #${lsIdx + 1} in ${chapterLabel}`;

          if (!lesson || typeof lesson !== 'object') {
            errors.push(`${lessonLabel} is not a valid object.`);
            return;
          }
          if (!lesson.title || typeof lesson.title !== 'string' || !lesson.title.trim()) {
            errors.push(`${lessonLabel} is missing a required title.`);
          }
          if (lesson.exercises && Array.isArray(lesson.exercises)) {
            exercisesCount += lesson.exercises.length;
          }

          if (lesson.assignments && Array.isArray(lesson.assignments)) {
            assignmentsCount += lesson.assignments.length;
            lesson.assignments.forEach((a, aIdx) => validateAssignment(a, `Assignment #${aIdx + 1} in ${lessonLabel}`, errors));
          }

          if (lesson.quiz) {
            quizzesCount++;
            validateQuizData(lesson.quiz, `Quiz in ${lessonLabel}`, errors);
          }
        });
      }
    });
  }

  // Validate class-level quizzes
  if (pack.quizzes && Array.isArray(pack.quizzes)) {
    pack.quizzes.forEach((q, idx) => {
      quizzesCount++;
      validateQuizData(q, `Class quiz #${idx + 1}`, errors);
    });
  }

  // Validate Resources
  let resourcesCount = 0;
  if (pack.resources && Array.isArray(pack.resources)) {
    resourcesCount = pack.resources.length;
    pack.resources.forEach((r, idx) => {
      if (!r || typeof r !== 'object' || !r.name) {
        errors.push(`Resource #${idx + 1} is missing a required file name.`);
      }
    });
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    schemaVersion,
    errors,
    warnings,
    unsupportedFeatures,
    summary: {
      classesCount: 1,
      chaptersCount,
      lessonsCount,
      exercisesCount,
      assignmentsCount,
      hasFinalProject,
      quizzesCount,
      resourcesCount,
    },
    data: isValid ? (pack as LearningPack) : undefined,
  };
}

function validateAssignment(assignment: unknown, label: string, errors: string[]) {
  if (!assignment || typeof assignment !== 'object') {
    errors.push(`${label} is not a valid object.`);
    return;
  }
  const a = assignment as Partial<LearningPackAssignment>;
  if (!a.title || typeof a.title !== 'string' || !a.title.trim()) {
    errors.push(`${label} is missing a required title.`);
  }
  if (!a.instructions || !Array.isArray(a.instructions) || a.instructions.length === 0) {
    errors.push(`${label} must contain at least one step in "instructions".`);
  }
}

function validateQuizData(quiz: unknown, label: string, errors: string[]) {
  if (!quiz || typeof quiz !== 'object') {
    errors.push(`${label} is not a valid object.`);
    return;
  }
  const q = quiz as { title?: string; questions?: unknown[] };
  if (!q.title || !q.title.trim()) {
    errors.push(`${label} is missing a title.`);
  }
  if (!q.questions || !Array.isArray(q.questions) || q.questions.length === 0) {
    errors.push(`${label} must contain at least one question.`);
  } else {
    q.questions.forEach((question, qIdx) => {
      const quest = question as { prompt?: string; options?: unknown[]; correctOptionIndex?: number };
      if (!quest.prompt || typeof quest.prompt !== 'string') {
        errors.push(`${label} question #${qIdx + 1} prompt is missing.`);
      }
      if (!quest.options || !Array.isArray(quest.options) || quest.options.length < 2) {
        errors.push(`${label} question #${qIdx + 1} must have at least 2 options.`);
      }
      if (
        typeof quest.correctOptionIndex !== 'number' ||
        quest.correctOptionIndex < 0 ||
        (quest.options && quest.correctOptionIndex >= quest.options.length)
      ) {
        errors.push(`${label} question #${qIdx + 1} correctOptionIndex is out of range.`);
      }
    });
  }
}

export interface ImportOptions {
  targetClassId?: string; // If provided, merge into existing class; else create new class
  overrideTitle?: string;
}

export interface ImportResult {
  classId: string;
  createdClass: LearningClass;
  chaptersCount: number;
  lessonsCount: number;
  assignmentsCount: number;
  quizzesCount: number;
  resourcesCount: number;
}

/**
 * Rollback-safe transactional import of a Learning Pack into IndexedDB.
 * Generates fresh UUIDs for all entities to prevent ID collisions.
 */
export async function importLearningPack(
  pack: LearningPack,
  options?: ImportOptions
): Promise<ImportResult> {
  const createdClassId = options?.targetClassId || crypto.randomUUID();
  let targetClass: LearningClass;

  // Track entities to roll back if failure occurs
  const createdChapterIds: string[] = [];
  const createdLessonIds: string[] = [];
  const createdQuizIds: string[] = [];
  const createdResourceIds: string[] = [];
  let isNewClass = false;

  try {
    const finalProject = pack.finalProject || pack.class.finalProject;

    if (options?.targetClassId) {
      const existing = (await storage.getClasses()).find((c) => c.id === options.targetClassId);
      if (!existing) {
        throw new Error(`Target class with ID ${options.targetClassId} does not exist.`);
      }
      targetClass = {
        ...existing,
        finalProject: existing.finalProject || finalProject,
        updatedAt: Date.now(),
      };
      await storage.saveClass(targetClass);
    } else {
      isNewClass = true;
      targetClass = {
        id: createdClassId,
        title: options?.overrideTitle || pack.class.title,
        description: pack.class.description || '',
        subject: pack.class.subject || 'Other',
        tags: pack.class.tags || [],
        color: pack.class.color || '#d97706',
        level: pack.class.level,
        language: pack.class.language,
        learningObjectives: pack.class.learningObjectives || [],
        finalProject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await storage.saveClass(targetClass);
    }

    // Existing chapter count for ordering if adding to existing class
    const existingChapters = await storage.getChapters(targetClass.id);
    let chapterOrderOffset = existingChapters.length;

    let totalLessons = 0;
    let totalAssignments = 0;
    let totalQuizzes = 0;

    // Process Chapters & Lessons
    for (const rawChapter of pack.chapters || []) {
      chapterOrderOffset++;
      const chapterId = crypto.randomUUID();
      const newChapter: Chapter = {
        id: chapterId,
        classId: targetClass.id,
        title: rawChapter.title,
        description: rawChapter.description,
        order: rawChapter.order !== undefined ? rawChapter.order : chapterOrderOffset,
      };

      await storage.saveChapter(newChapter);
      createdChapterIds.push(chapterId);

      let lessonOrder = 0;
      for (const rawLesson of rawChapter.lessons || []) {
        lessonOrder++;
        totalLessons++;
        const lessonId = crypto.randomUUID();

        // Process assignments in lesson
        const lessonAssignments: Assignment[] = (rawLesson.assignments || []).map((a) => {
          totalAssignments++;
          return {
            id: crypto.randomUUID(),
            title: a.title,
            description: a.description,
            instructions: a.instructions,
            submissionType: a.submissionType || 'text',
            rubric: a.rubric,
            answerKeyOrModelAnswer: a.answerKeyOrModelAnswer,
            attachmentResourceNames: a.attachmentResourceNames,
          };
        });

        // Build markdown content with embedded exercises, assignments, rubrics & takeaways
        let lessonMarkdown = rawLesson.content || '';

        if (rawLesson.learningObjectives && rawLesson.learningObjectives.length > 0) {
          const objectivesText = `\n\n### Learning Objectives\n` + rawLesson.learningObjectives.map((o) => `- ${o}`).join('\n');
          if (!lessonMarkdown.includes(objectivesText.trim())) {
            lessonMarkdown = `${objectivesText}\n\n${lessonMarkdown}`;
          }
        }
        if (rawLesson.keyTakeaways && rawLesson.keyTakeaways.length > 0) {
          const takeawaysText = `\n\n### Key Takeaways\n` + rawLesson.keyTakeaways.map((t) => `- ${t}`).join('\n');
          if (!lessonMarkdown.includes(takeawaysText.trim())) {
            lessonMarkdown += takeawaysText;
          }
        }
        if (rawLesson.exercises && rawLesson.exercises.length > 0) {
          const exercisesText = `\n\n### Practical Exercises\n` + rawLesson.exercises.map((e, idx) => `${idx + 1}. ${e}`).join('\n');
          if (!lessonMarkdown.includes(exercisesText.trim())) {
            lessonMarkdown += exercisesText;
          }
        }

        // Embed Assignments & Rubric into reading view if present
        if (lessonAssignments.length > 0) {
          let assignmentsText = `\n\n### Practical Assignments & Tasks\n`;
          lessonAssignments.forEach((assign) => {
            assignmentsText += `\n#### Assignment: ${assign.title}\n${assign.description}\n\n**Instructions:**\n`;
            assign.instructions.forEach((inst, i) => {
              assignmentsText += `${i + 1}. ${inst}\n`;
            });
            if (assign.submissionType && assign.submissionType !== 'none') {
              assignmentsText += `\n*Expected Submission Format: ${assign.submissionType.toUpperCase()}*\n`;
            }
            if (assign.rubric && assign.rubric.length > 0) {
              assignmentsText += `\n**Evaluation Rubric:**\n`;
              assign.rubric.forEach((r) => {
                assignmentsText += `- **${r.criteria}**${r.points ? ` (${r.points} pts)` : ''}: ${r.description}\n`;
              });
            }
            if (assign.answerKeyOrModelAnswer) {
              assignmentsText += `\n> **Model Answer / Answer Key Guide:**\n> ${assign.answerKeyOrModelAnswer.replace(/\n/g, '\n> ')}\n`;
            }
          });
          if (!lessonMarkdown.includes('### Practical Assignments & Tasks')) {
            lessonMarkdown += assignmentsText;
          }
        }

        const newLesson: Lesson = {
          id: lessonId,
          classId: targetClass.id,
          chapterId: chapterId,
          title: rawLesson.title,
          content: lessonMarkdown.trim(),
          learningObjectives: rawLesson.learningObjectives,
          keyTakeaways: rawLesson.keyTakeaways,
          exercises: rawLesson.exercises,
          assignments: lessonAssignments.length > 0 ? lessonAssignments : undefined,
          order: rawLesson.order !== undefined ? rawLesson.order : lessonOrder,
          isCompleted: false,
          updatedAt: Date.now(),
        };

        await storage.saveLesson(newLesson);
        createdLessonIds.push(lessonId);

        // Lesson-level quiz
        if (rawLesson.quiz) {
          totalQuizzes++;
          const quizId = crypto.randomUUID();
          const newQuiz: Quiz = {
            id: quizId,
            classId: targetClass.id,
            lessonId: lessonId,
            title: rawLesson.quiz.title,
            description: rawLesson.quiz.description,
            questions: rawLesson.quiz.questions.map((q) => ({
              id: crypto.randomUUID(),
              prompt: q.prompt,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
              explanation: q.explanation || '',
            })),
            createdAt: Date.now(),
          };
          await storage.saveQuiz(newQuiz);
          createdQuizIds.push(quizId);
        }
      }
    }

    // Class-level assignments / Capstones (if present as course-level chapter)
    if (pack.assignments && pack.assignments.length > 0) {
      const capstoneChapterId = crypto.randomUUID();
      chapterOrderOffset++;
      await storage.saveChapter({
        id: capstoneChapterId,
        classId: targetClass.id,
        title: 'Assignments & Capstone Exercises',
        description: 'Comprehensive course evaluations',
        order: chapterOrderOffset,
      });
      createdChapterIds.push(capstoneChapterId);

      for (let i = 0; i < pack.assignments.length; i++) {
        const ca = pack.assignments[i];
        totalLessons++;
        totalAssignments++;
        const assignLessonId = crypto.randomUUID();

        let assignContent = `# ${ca.title}\n\n${ca.description}\n\n### Instructions\n`;
        ca.instructions.forEach((inst, idx) => {
          assignContent += `${idx + 1}. ${inst}\n`;
        });
        if (ca.rubric && ca.rubric.length > 0) {
          assignContent += `\n### Evaluation Rubric\n`;
          ca.rubric.forEach((r) => {
            assignContent += `- **${r.criteria}**${r.points ? ` (${r.points} pts)` : ''}: ${r.description}\n`;
          });
        }
        if (ca.answerKeyOrModelAnswer) {
          assignContent += `\n> **Evaluation Model Guide:**\n> ${ca.answerKeyOrModelAnswer.replace(/\n/g, '\n> ')}\n`;
        }

        await storage.saveLesson({
          id: assignLessonId,
          classId: targetClass.id,
          chapterId: capstoneChapterId,
          title: ca.title,
          content: assignContent.trim(),
          order: i + 1,
          isCompleted: false,
          updatedAt: Date.now(),
        });
        createdLessonIds.push(assignLessonId);
      }
    }

    // Class-level final project chapter
    if (finalProject) {
      const projectChapterId = crypto.randomUUID();
      chapterOrderOffset++;
      await storage.saveChapter({
        id: projectChapterId,
        classId: targetClass.id,
        title: `Final Project: ${finalProject.title}`,
        description: 'Culminating course project',
        order: chapterOrderOffset,
      });
      createdChapterIds.push(projectChapterId);

      let projContent = `# Final Project: ${finalProject.title}\n\n${finalProject.brief}\n\n`;
      if (finalProject.milestones && finalProject.milestones.length > 0) {
        projContent += `### Project Milestones\n`;
        finalProject.milestones.forEach((m, idx) => {
          projContent += `${idx + 1}. ${m}\n`;
        });
      }
      if (finalProject.submissionGuidelines) {
        projContent += `\n### Submission Guidelines\n${finalProject.submissionGuidelines}\n`;
      }
      if (finalProject.evaluationRubric && finalProject.evaluationRubric.length > 0) {
        projContent += `\n### Evaluation Rubric\n`;
        finalProject.evaluationRubric.forEach((r) => {
          projContent += `- **${r.criteria}**: ${r.description}\n`;
        });
      }

      const projLessonId = crypto.randomUUID();
      totalLessons++;
      await storage.saveLesson({
        id: projLessonId,
        classId: targetClass.id,
        chapterId: projectChapterId,
        title: `Project Brief & Rubric`,
        content: projContent.trim(),
        order: 1,
        isCompleted: false,
        updatedAt: Date.now(),
      });
      createdLessonIds.push(projLessonId);
    }

    // Class-level quizzes
    for (const rawQuiz of pack.quizzes || []) {
      totalQuizzes++;
      const quizId = crypto.randomUUID();
      const newQuiz: Quiz = {
        id: quizId,
        classId: targetClass.id,
        title: rawQuiz.title,
        description: rawQuiz.description,
        questions: rawQuiz.questions.map((q) => ({
          id: crypto.randomUUID(),
          prompt: q.prompt,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation || '',
        })),
        createdAt: Date.now(),
      };
      await storage.saveQuiz(newQuiz);
      createdQuizIds.push(quizId);
    }

    // Resources
    let totalResources = 0;
    for (const rawRes of pack.resources || []) {
      totalResources++;
      const resId = crypto.randomUUID();
      let blob: Blob | undefined;
      let dataUrl: string | undefined;

      if (rawRes.contentBase64) {
        dataUrl = rawRes.contentBase64.startsWith('data:')
          ? rawRes.contentBase64
          : `data:${rawRes.fileType || 'application/octet-stream'};base64,${rawRes.contentBase64}`;
        try {
          const res = await fetch(dataUrl);
          blob = await res.blob();
        } catch {
          // ignore
        }
      } else if (rawRes.contentText) {
        blob = new Blob([rawRes.contentText], { type: rawRes.fileType || 'text/plain' });
      }

      const resourceItem: ResourceItem = {
        id: resId,
        classId: targetClass.id,
        name: rawRes.name,
        fileType: rawRes.fileType || 'text/plain',
        size: blob ? blob.size : rawRes.contentText?.length || 0,
        description: rawRes.description,
        extractedText: rawRes.contentText,
        status: rawRes.contentText ? 'extracted' : 'ready',
        dataBlob: blob,
        dataUrl,
        uploadedAt: Date.now(),
      };

      await storage.saveResource(resourceItem);
      createdResourceIds.push(resId);
    }

    return {
      classId: targetClass.id,
      createdClass: targetClass,
      chaptersCount: createdChapterIds.length,
      lessonsCount: totalLessons,
      assignmentsCount: totalAssignments,
      quizzesCount: totalQuizzes,
      resourcesCount: totalResources,
    };
  } catch (err) {
    // Rollback changes to prevent half-imported broken state
    console.error('Import failed, initiating rollback:', err);
    for (const rId of createdResourceIds) {
      await storage.deleteResource(rId).catch(() => {});
    }
    for (const qId of createdQuizIds) {
      await storage.deleteQuiz(qId).catch(() => {});
    }
    for (const lId of createdLessonIds) {
      await storage.deleteLesson(lId).catch(() => {});
    }
    for (const cId of createdChapterIds) {
      await storage.deleteChapter(cId).catch(() => {});
    }
    if (isNewClass) {
      await storage.deleteClass(createdClassId).catch(() => {});
    }
    throw err;
  }
}

/**
 * Exports an existing class and its associated chapters, lessons, quizzes, and resources
 * into a standardized Learning Pack JSON string (schema version 1.1).
 */
export async function exportLearningPack(classId: string): Promise<string> {
  const classes = await storage.getClasses();
  const targetClass = classes.find((c) => c.id === classId);
  if (!targetClass) {
    throw new Error(`Class with ID "${classId}" not found.`);
  }

  const [chapters, lessons, quizzes, resources] = await Promise.all([
    storage.getChapters(classId),
    storage.getLessons(classId),
    storage.getQuizzes(classId),
    storage.getResources(classId),
  ]);

  // Map chapters and embed corresponding lessons
  const packChapters = chapters.map((ch) => {
    const chapterLessons = lessons
      .filter((l) => l.chapterId === ch.id)
      .sort((a, b) => a.order - b.order)
      .map((l) => {
        const lessonQuiz = quizzes.find((q) => q.lessonId === l.id);
        return {
          title: l.title,
          content: l.content,
          learningObjectives: l.learningObjectives,
          keyTakeaways: l.keyTakeaways,
          exercises: l.exercises,
          assignments: l.assignments,
          order: l.order,
          quiz: lessonQuiz
            ? {
                title: lessonQuiz.title,
                description: lessonQuiz.description,
                questions: lessonQuiz.questions.map((q) => ({
                  prompt: q.prompt,
                  options: q.options,
                  correctOptionIndex: q.correctOptionIndex,
                  explanation: q.explanation,
                })),
              }
            : undefined,
        };
      });

    return {
      title: ch.title,
      description: ch.description,
      order: ch.order,
      lessons: chapterLessons,
    };
  });

  // Class-level quizzes (not assigned to a specific lesson)
  const packQuizzes = quizzes
    .filter((q) => !q.lessonId)
    .map((q) => ({
      title: q.title,
      description: q.description,
      questions: q.questions.map((quest) => ({
        prompt: quest.prompt,
        options: quest.options,
        correctOptionIndex: quest.correctOptionIndex,
        explanation: quest.explanation,
      })),
    }));

  // Map resources with optional base64 serialization
  const packResources = await Promise.all(
    resources.map(async (r) => {
      let contentBase64 = r.dataUrl;
      if (r.dataBlob && !contentBase64 && typeof r.dataBlob === 'object' && 'size' in r.dataBlob) {
        try {
          contentBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(r.dataBlob as Blob);
          });
        } catch {
          // fallback if FileReader fails in test environment
        }
      }
      return {
        name: r.name,
        fileType: r.fileType,
        description: r.description,
        contentBase64,
        contentText: r.extractedText,
      };
    })
  );

  const pack: LearningPack = {
    schemaVersion: '1.1',
    exportedAt: Date.now(),
    class: {
      title: targetClass.title,
      description: targetClass.description,
      subject: targetClass.subject,
      tags: targetClass.tags,
      color: targetClass.color,
      level: targetClass.level,
      language: targetClass.language,
      learningObjectives: targetClass.learningObjectives,
      finalProject: targetClass.finalProject,
    },
    chapters: packChapters,
    quizzes: packQuizzes.length > 0 ? packQuizzes : undefined,
    resources: packResources.length > 0 ? packResources : undefined,
  };

  return JSON.stringify(pack, null, 2);
}
