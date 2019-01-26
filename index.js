const prompts = require("prompts");
const LessonReserver = require("./LessonReserver");

require("dotenv").config();
const email = process.env.BMONSTER_EMAIL;
const password = process.env.BMONSTER_PASSWORD;

const askStudioId = {
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
    { title: "栄スタジオ", value: "0005" },
  ]
};

const askLessonId = {
  type: "text",
  name: "lessonId",
  message: "レッスンIDを入力してください"
};

async function main() {
  const { studioId } = await prompts(askStudioId);
  const { lessonId } = await prompts(askLessonId);

  if (studioId && lessonId) {
    reserver = new LessonReserver(studioId, lessonId);
  
    const bagId = await reserver.waitUntilBagAvaiable();
    await reserver.signIn(email, password);
    await reserver.reserve(bagId);
  } else {
    console.log("スタジオとレッスンを選択してください")
  }
}

main();
