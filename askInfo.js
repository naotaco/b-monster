const prompts = require("prompts");
const getDateList = require("./getDateList");
const getLessons = require("./getLessons");

require("dotenv").config();
const preferences = {
  "0001": JSON.parse(process.env.GINZA_PREFERENCES),
  "0002": JSON.parse(process.env.AOYAMA_PREFERENCES),
  "0003": JSON.parse(process.env.EBISU_PREFERENCES),
  "0004": JSON.parse(process.env.SHINJUKU_PREFERENCES),
  "0006": JSON.parse(process.env.IKEBUKURO_PREFERENCES)
};

async function askInfo() {
  const { interval } = await prompts(askInterval);
  if (!interval) {
    throw Error("入力を中断しました");
  }

  const { date } = await prompts(askDate);
  if (!date) {
    throw Error("入力を中断しました");
  }

  const { studioId } = await prompts(askStudio);
  if (!studioId) {
    throw Error("入力を中断しました");
  }

  const lessons = await getLessons(date, studioId);
  if (lessons.length === 0) {
    throw Error("選択可能なレッスンが見つかりませんでした");
  }

  const { lesson } = await prompts(askLesson(lessons));
  if (!lesson) {
    throw Error("入力を中断しました");
  }

  return {
    interval,
    studioId,
    lesson,
    preferences: preferences[studioId] || []
  };
}

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
  choices: [
    {
      title: "5秒(推奨)",
      value: 5000
    },
    {
      title:
        "2秒(30分前のキャンセル待ちをどうしても取りたい場合、長時間実行禁止)",
      value: 2000
    },
    {
      title: "30秒(夜寝ながら予約したい場合はこれ)",
      value: 30000
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

module.exports = askInfo;
