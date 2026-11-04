import { storage } from './storage';

export interface GlobalSearchResult {
  id: string;
  type:
    | 'class'
    | 'lesson'
    | 'note'
    | 'flashcard'
    | 'assignment'
    | 'skill'
    | 'path'
    | 'portfolio';
  title: string;
  subtitle?: string;
  snippet?: string;
  classId?: string;
  lessonId?: string;
}

export class SearchService {
  /**
   * Performs an integrated full-text search across all personal learning modules.
   * Debounced and fast; avoids loading file binaries.
   */
  async search(query: string): Promise<GlobalSearchResult[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const [
      classes,
      lessons,
      notes,
      cards,
      skills,
      paths,
      projects,
    ] = await Promise.all([
      storage.getClasses(),
      storage.getLessons(''),
      storage.getNotes(),
      storage.getFlashcards(),
      storage.getSkills(),
      storage.getLearningPaths(),
      storage.getPortfolioProjects(),
    ]);

    const results: GlobalSearchResult[] = [];

    // 1. Search Classes
    for (const c of classes) {
      if (
        c.title.toLowerCase().includes(cleanQuery) ||
        c.description.toLowerCase().includes(cleanQuery) ||
        c.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      ) {
        results.push({
          id: c.id,
          type: 'class',
          title: c.title,
          subtitle: `Subject: ${c.subject}`,
          snippet: c.description.slice(0, 100),
          classId: c.id,
        });
      }
    }

    // 2. Search Lessons
    for (const l of lessons) {
      if (
        l.title.toLowerCase().includes(cleanQuery) ||
        l.content.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: l.id,
          type: 'lesson',
          title: l.title,
          subtitle: 'Lesson',
          snippet: l.content.slice(0, 120).replace(/[#*`_]/g, ''),
          classId: l.classId,
          lessonId: l.id,
        });
      }
    }

    // 3. Search Notes
    for (const n of notes) {
      if (
        n.title.toLowerCase().includes(cleanQuery) ||
        n.content.toLowerCase().includes(cleanQuery) ||
        n.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      ) {
        results.push({
          id: n.id,
          type: 'note',
          title: n.title,
          subtitle: n.isPinned ? 'Pinned Note' : 'Notebook',
          snippet: n.content.slice(0, 100),
          classId: n.classId,
          lessonId: n.lessonId,
        });
      }
    }

    // 4. Search Flashcards
    for (const fc of cards) {
      if (
        fc.front.toLowerCase().includes(cleanQuery) ||
        fc.back.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: fc.id,
          type: 'flashcard',
          title: fc.front,
          subtitle: 'Flashcard',
          snippet: fc.back.slice(0, 100),
          classId: fc.classId,
          lessonId: fc.lessonId,
        });
      }
    }

    // 5. Search Skills
    for (const sk of skills) {
      if (
        sk.name.toLowerCase().includes(cleanQuery) ||
        sk.description.toLowerCase().includes(cleanQuery) ||
        sk.category.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: sk.id,
          type: 'skill',
          title: sk.name,
          subtitle: `Skill (${sk.level.toUpperCase()})`,
          snippet: sk.description.slice(0, 100),
        });
      }
    }

    // 6. Search Learning Paths
    for (const p of paths) {
      if (
        p.title.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: p.id,
          type: 'path',
          title: p.title,
          subtitle: 'Learning Path',
          snippet: p.description.slice(0, 100),
        });
      }
    }

    // 7. Search Portfolio Projects
    for (const proj of projects) {
      if (
        proj.title.toLowerCase().includes(cleanQuery) ||
        proj.description.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          id: proj.id,
          type: 'portfolio',
          title: proj.title,
          subtitle: `Project (${proj.status})`,
          snippet: proj.description.slice(0, 100),
        });
      }
    }

    return results.slice(0, 30);
  }
}

export const searchService = new SearchService();
