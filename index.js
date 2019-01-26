const prompts = require("prompts");
const getDateList = require("./getDateList");
const getLessons = require("./getLessons");
const LessonReserver = require("./LessonReserver");

require("dotenv").config();
const email = process.env.BMONSTER_EMAIL;
const password = process.env.BMONSTER_PASSWORD;

const askDate = {
  type: "select",
  name: "date",
  message: "日付を選択してください",
  choices: getDateList().map(date => ({
    title: date.format("M/DD"),
    value: date
  }))
};

const askInterval = {
  type: "select",
  name: "interval",
  message: "チェックするインターバルを選択してください",
  initial: 1,
  choices: [
    {
      title: "2秒(30分前のキャンセル待ちをどうしても取りたい場合、長時間実行禁止)",
      value: 2000
    },
    {
      title: "5秒(推奨)",
      value: 5000
    },
    {
      title: "1分(夜寝ながら予約したい場合はこれ)",
      value: 60000
    }
  ]
};

const askStudio = {
  type: "select",
  name: "studioId",
  message: "スタジオを選択してください",
  choices: [
    { title: "恵比寿スタジオ", value: "0003" },
    { title: "新宿スタジオ", value: "0004" },
    { title: "銀座スタジオ", value: "0001" },
    { title: "池袋スタジオ", value: "0006" },
    { title: "青山スタジオ", value: "0002" },
    { title: "羽田スタジオ", value: "0007" },
    { title: "栄スタジオ", value: "0005" }
  ]
};

function askLesson(lessons) {
  return {
    type: "select",
    name: "lesson",
    message: "レッスンを選択してください",
    choices: lessons.map(lesson => ({
      title: `${lesson.time} ${lesson.instructor} ${lesson.mode}`,
      value: lesson
    }))
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

  const { studioId } = await prompts(askStudio);
  if (!studioId) {
    return;
  }

  const lessons = await getLessons(date, studioId);
  if (lessons.length === 0) {
    console.log("選択可能なレッスンが見つかりませんでした");
    return;
  }

  const { lesson } = await prompts(askLesson(lessons));
  if (!lesson) {
    return;
  }

  reserver = new LessonReserver(studioId, lesson, interval);

  const bagId = await reserver.waitUntilBagAvaiable();
  await reserver.signIn(email, password);
  await reserver.reserve(bagId);
}

main();
