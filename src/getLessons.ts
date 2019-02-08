import axios from 'axios';
import { Dayjs } from 'dayjs';
import { JSDOM } from 'jsdom';
import Lesson from './Lesson';

export default async function getLessons(
  date: Dayjs,
  studioId: string,
): Promise<Lesson[]> {
  const res = await axios.get(
    `https://www.b-monster.jp/reserve/?studio_code=${studioId}`,
  );
  const dom = new JSDOM(res.data);
  const timeTable: Element | null = dom.window.document.getElementById(
    'time-table',
  );

  if (timeTable === null) {
    throw new Error('タイムテーブルが見つかりませんでした');
  }

  const lessonColumns: NodeListOf<Element> = timeTable.querySelectorAll(
    '.flex-no-wrap',
  );

  const matchedColumn = matchLessonColumns(lessonColumns, date);
  if (matchedColumn === null) {
    return [];
  }

  const lessons = buildLessons(matchedColumn);

  return lessons;
}

function matchLessonColumns(
  lessonColumns: NodeListOf<Element>,
  date: Dayjs,
): Element | null {
  const dateText = date.format('M月D日');

  let column: Element | null = null;
  lessonColumns.forEach((c) => {
    const columnDateTextContainer: Element | null = c.querySelector(
      'h3.smooth-text',
    );

    if (
      columnDateTextContainer !== null &&
      columnDateTextContainer.textContent !== null
    ) {
      const text = columnDateTextContainer.textContent;
      if (text.startsWith(dateText)) {
        column = c;
      }
    }
  });

  return column;
}

function buildLessons(lessonColumn: Element): Lesson[] {
  const lessonDivs = lessonColumn.querySelectorAll('.panel:not(.done)');

  const result: Lesson[] = [];
  lessonDivs.forEach((div) => {
    const lesson: Lesson | null = buildLesson(div);
    if (lesson !== null && lesson.isReservable) {
      result.push(lesson);
    }
  });

  return result;
}

function buildLesson(div: Element): Lesson | null {
  const timeContainer: Element | null = div.querySelector('.tt-time');
  const instructorContainer: Element | null = div.querySelector(
    '.tt-instructor',
  );
  const modeContainer: Element | null = div.querySelector('.tt-mode');
  const linkContainer: HTMLAnchorElement | null = div.querySelector('a');

  if (
    timeContainer === null ||
    instructorContainer === null ||
    modeContainer === null ||
    linkContainer === null
  ) {
    return null;
  }

  const link: string = linkContainer.href;
  const lessonIdMatchResult: RegExpMatchArray | null = link.match(
    /lesson_id=(.+)&/,
  );

  if (lessonIdMatchResult === null) {
    return null;
  }

  const instructor = instructorContainer.textContent || '';
  const mode = modeContainer.textContent || '';
  const time = timeContainer.textContent || '';
  const lessonId = lessonIdMatchResult[1];

  return new Lesson(instructor, lessonId, mode.trim(), time);
}
