# Selesai Makan — Official Learning Pack Specification & AI Prompt Template

**Schema Version:** `1.1` (Backwards compatible with `1.0`)

This document defines the official standard for **Selesai Makan Learning Packs (`.json`)**.
External AI assistants (e.g. Claude, ChatGPT, Gemini, local LLMs) can use this exact template to generate rich, self-contained educational courses and practice tracks from raw ebooks, notes, or curricula.

---

## 1. System Prompt for External AI Assistants

When asking an AI to generate a Learning Pack from a book, article, or topic, include this prompt:

```text
You are an instructional designer and curriculum specialist.
Create a complete, ready-to-study course for the "Selesai Makan" Personal Learning Hub.

Output ONLY a valid JSON object matching the Selesai Makan Learning Pack v1.1 schema.
Do NOT output markdown code blocks (```json) or conversational text around the JSON.

Key Requirements:
1. Provide full, thorough instructional markdown in "content" (not brief summaries).
2. Include concrete examples, key takeaways, and practical exercises.
3. Design realistic assignments with instructions and rubrics adapted to the subject:
   - For technical/data courses (e.g., Excel): spreadsheet exercises & formulas.
   - For writing/marketing (e.g., Copywriting): drafting headlines & critiques.
   - For management/HR: case studies and rubric-based evaluations.
4. Include interactive multiple-choice quizzes with clear answer rationale ("explanation").
5. If source material includes reference tables or cheatsheets, include them under "resources" as "contentText".
```

---

## 2. Complete JSON Template & Field Reference

```json
{
  "schemaVersion": "1.1",
  "class": {
    "title": "Microsoft Excel: Advanced Data Analysis & Modeling",
    "description": "Master dynamic formulas, XLOOKUP, PivotTables, and financial forecasting with hands-on practice.",
    "subject": "Microsoft Excel",
    "level": "Intermediate",
    "language": "English",
    "tags": ["Excel", "Data Analysis", "Formulas", "Financial Modeling"],
    "color": "#059669",
    "learningObjectives": [
      "Construct robust spreadsheet models with modern dynamic array functions",
      "Automate multi-criteria lookup workflows safely",
      "Build interactive executive summary dashboards"
    ],
    "finalProject": {
      "title": "Comprehensive 3-Year Corporate Budget Model",
      "brief": "Design a dynamic, fully linked 3-year departmental budget and variance analysis workbook.",
      "milestones": [
        "Phase 1: Build input assumption table and validation rules",
        "Phase 2: Assemble P&L forecast with dynamic monthly lookups",
        "Phase 3: Design executive dashboard with KPI variance indicators"
      ],
      "submissionGuidelines": "Submit an .xlsx workbook with zero hardcoded formula values.",
      "evaluationRubric": [
        {
          "criteria": "Formula Dynamic Structure",
          "description": "Utilizes dynamic arrays and exact match lookups without legacy #N/A risks."
        },
        {
          "criteria": "Financial Integrity & Formatting",
          "description": "Clear number formatting, assumption separation, and self-documenting comments."
        }
      ]
    }
  },
  "chapters": [
    {
      "title": "Chapter 1: Modern Lookup & Dynamic Arrays",
      "description": "Transitioning from VLOOKUP to XLOOKUP and dynamic matrix functions",
      "order": 1,
      "lessons": [
        {
          "title": "Lesson 1.1: XLOOKUP vs Legacy Lookups",
          "content": "# XLOOKUP vs Legacy Lookups\n\nXLOOKUP replaces `VLOOKUP`, `HLOOKUP`, and `LOOKUP` with safer default behavior.\n\n### Why XLOOKUP is Superior\n1. **Defaults to Exact Match**: Eliminates false matches.\n2. **Left-Lookup Native**: Does not require column index count calculations.\n3. **Built-in Error Handling**: Uses the optional `if_not_found` parameter.\n\n```excel\n=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])\n```\n\n> *Pro Tip:* Always separate your Raw Data table from your Reporting Presentation table.",
          "learningObjectives": [
            "Explain why left-lookup failed in traditional VLOOKUP",
            "Implement XLOOKUP with fallback values"
          ],
          "keyTakeaways": [
            "XLOOKUP defaults to exact match (0)",
            "Return arrays can span multiple columns simultaneously"
          ],
          "exercises": [
            "Write a formula to look up employee ID 1045 and return both Name and Department in one formula.",
            "Test replacing an IFERROR(VLOOKUP(...)) wrapper with XLOOKUP's built-in argument."
          ],
          "assignments": [
            {
              "title": "Employee Bonus Schedule Lookup Task",
              "description": "Given a tiered revenue performance table, build a lookup formula that returns corresponding commission rates.",
              "instructions": [
                "Inspect the provided commission tier matrix.",
                "Implement an XLOOKUP with match_mode -1 (exact match or next smaller item).",
                "Ensure commission payouts correctly compute for target ranges."
              ],
              "submissionType": "spreadsheet",
              "rubric": [
                {
                  "criteria": "Exact Match vs Approx Match Selection",
                  "points": 50,
                  "description": "Correctly chooses approximate matching mode -1 for tiered thresholds."
                },
                {
                  "criteria": "Formula Modularity",
                  "points": 50,
                  "description": "References structured table headers rather than hardcoded column numbers."
                }
              ],
              "answerKeyOrModelAnswer": "=XLOOKUP(D2, Tiers[SalesTarget], Tiers[CommissionRate], 0, -1)"
            }
          ],
          "order": 1,
          "quiz": {
            "title": "XLOOKUP Mastery Assessment",
            "description": "Verify your understanding of lookup arguments and error handling.",
            "questions": [
              {
                "prompt": "What is the default match mode for XLOOKUP if omitted?",
                "options": [
                  "Exact match (0)",
                  "Approximate match (1)",
                  "Wildcard match (2)",
                  "Reverse match (-1)"
                ],
                "correctOptionIndex": 0,
                "explanation": "Unlike VLOOKUP which defaulted to approximate matching (TRUE/1), XLOOKUP defaults safely to exact matching (0)."
              }
            ]
          }
        }
      ]
    }
  ],
  "resources": [
    {
      "name": "excel-formula-quick-reference.txt",
      "fileType": "text/plain",
      "description": "Cheatsheet of essential modern formulas",
      "contentText": "XLOOKUP: =XLOOKUP(val, lookup_rng, return_rng, \"Not Found\")\nFILTER: =FILTER(array, include_criteria, \"Empty\")\nUNIQUE: =UNIQUE(array)\nSORT: =SORT(array, sort_index, sort_order)"
    }
  ]
}
```

---

## 3. Schema Rules and Guidelines

1. **Root Object:**
   * `schemaVersion`: `"1.1"` (or `"1.0"`).
   * `class`: Course metadata object (Required).
   * `chapters`: Array of chapter objects (Required).
   * `finalProject`: Optional culminating project specifications.
   * `resources`: Array of supplementary documents or reference attachments.

2. **Lessons (`class.chapters[].lessons`):**
   * `title` (Required): String.
   * `content` (Required): Comprehensive Markdown text (with headings, code blocks, bullet points).
   * `learningObjectives`: Array of strings (Optional).
   * `keyTakeaways`: Array of strings (Optional).
   * `exercises`: Array of practical prompts/tasks (Optional).
   * `assignments`: Array of structured assignments with instructions, submission types, and rubrics (Optional).
   * `quiz`: Interactive multiple-choice check with question list, zero-indexed `correctOptionIndex`, and explanatory notes (Optional).

3. **Resources (`resources`):**
   * `name`: File name with extension (e.g. `.txt`, `.csv`, `.pdf`, `.md`).
   * `contentText`: Plain text, markdown, or CSV data for text-based materials.
   * `contentBase64`: Data URL base64 string for binary attachments (PDF, images, etc.).
