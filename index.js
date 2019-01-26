const prompts = require("prompts");
const LessonReserver = require("./LessonReserver");

require("dotenv").config();
const email = process.env.BMONSTER_EMAIL;
const password = process.env.BMONSTER_PASSWORD;

const askStudioId = {
  type: "text",
  name: "studioId",
  message: "スタジオIDを入力してください"
};

const askLessonId = {
  type: "text",
  name: "lessonId",
  message: "レッスンIDを入力してください"
};

async function main() {
  const studioId = await prompts(askStudioId);
  const lessonId = await prompts(askLessonId);

  reserver = new LessonReserver(studioId, lessonId);
  await reserver.signIn(email, password);

  const bagId = await reserver.waitUntilBagAvaiable();
  reserver.reserve(bagId);
}

main();
