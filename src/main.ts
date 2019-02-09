import dotenv from 'dotenv';
import prompts from 'prompts';
import getDateList from '~/getDateList';
import getLessons from '~/getLessons';
import Lesson from '~/Lesson';
import LessonReserver from '~/LessonReserver';
import Logger from '~/logger';

const logger = new Logger();

dotenv.config();
const email = process.env.BMONSTER_EMAIL || '';
const password = process.env.BMONSTER_PASSWORD || '';

const askDate: any = {
  choices: getDateList().map((date) => ({
    title: date.format('M/DD'),
    value: date,
  })),
  message: '日付を選択してください',
  name: 'date',
  type: 'select',
};

const askInterval: any = {
  choices: [
    {
      title: '5秒(推奨)',
      value: 5000,
    },
    {
      title:
        '2秒(30分前のキャンセル待ちをどうしても取りたい場合、長時間実行禁止)',
      value: 2000,
    },
    {
      title: '1分(夜寝ながら予約したい場合はこれ)',
      value: 60000,
    },
  ],
  message: 'チェックするインターバルを選択してください',
  name: 'interval',
  type: 'select',
};

const askStudio: any = {
  choices: [
    { title: '恵比寿スタジオ', value: '0003' },
    { title: '新宿スタジオ', value: '0004' },
    { title: '銀座スタジオ', value: '0001' },
    { title: '池袋スタジオ', value: '0006' },
    { title: '青山スタジオ', value: '0002' },
    { title: '羽田スタジオ', value: '0007' },
    { title: '栄スタジオ', value: '0005' },
  ],
  message: 'スタジオを選択してください',
  name: 'studioId',
  type: 'select',
};

function askLesson(lessons: Lesson[]): any {
  return {
    choices: lessons.map((lesson) => ({
      title: `${lesson.time} ${lesson.instructor} ${lesson.mode}`,
      value: lesson,
    })),
    message: 'レッスンを選択してください',
    name: 'lesson',
    type: 'select',
  };
}

async function main() {
  const { interval } = await prompts(askInterval);
  if (!interval) {
    return;
  }

  const { date } = await prompts(askDate);
  if (!date) {
    return;
  }

  const { studioId }: { studioId: string | null } = await prompts(askStudio);
  if (!studioId) {
    return;
  }

  const lessons: Lesson[] = await getLessons(date, studioId);
  if (lessons.length === 0) {
    logger.log('選択可能なレッスンが見つかりませんでした');
    return;
  }

  const { lesson } = await prompts(askLesson(lessons));
  if (!lesson) {
    return;
  }

  const reserver = new LessonReserver(studioId, lesson, interval, logger);

  const bagId: number = await reserver.waitUntilBagAvaiable();
  await reserver.signIn(email, password);
  await reserver.reserve(bagId);
}

main();
