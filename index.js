
const askInfo = require("./askInfo");
const authenticate = require("./authenticate");
const reserveLesson = require("./reserveLesson");
const waitUntilBagAvaiable = require("./waitUntilBagAvailable");

require("dotenv").config();
const email = process.env.BMONSTER_EMAIL;
const password = process.env.BMONSTER_PASSWORD;


async function main() {
  const {
    interval,
    studioId,
    lesson
  } = await askInfo();

  const bagId = await waitUntilBagAvaiable(studioId, lesson.lessonId, interval);
  const authToken = await authenticate(email, password);
  await reserveLesson(authToken, lesson, bagId);
}

main();
