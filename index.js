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
    name: "lessonId",
    message: "レッスンを選択してください",
    choices: lessons.map(l => ({
      title: `${l.time} ${l.instructor} ${l.mode}`,
      value: l.lessonId
    }))
  };
}

async function main() {
  const { date } = await prompts(askDate);
  const { studioId } = await prompts(askStudio);

  const lessons = await getLessons(date, studioId);

  if (!lessons) {
    console.log("選択可能なレッスンが見つかりませんでした")
  }
  const { lessonId } = await prompts(askLesson(lessons));

  if (studioId && lessonId) {
    reserver = new LessonReserver(studioId, lessonId);

    const bagId = await reserver.waitUntilBagAvaiable();
    await reserver.signIn(email, password);
    await reserver.reserve(bagId);
  } else {
    console.log("スタジオとレッスンを選択してください");
  }
}

main();
