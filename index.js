const askInfo = require("./askInfo");
const authenticate = require("./authenticate");
const reserveLesson = require("./reserveLesson");
const moveBag = require("./moveBag");
const waitUntilBagAvaiable = require("./waitUntilBagAvailable");
const chooseBag = require("./chooseBag");
const { sleep } = require("./util");

require("dotenv").config();
const email = process.env.BMONSTER_EMAIL;
const password = process.env.BMONSTER_PASSWORD;

async function main() {
  const { interval, studioId, lesson, preferences } = await askInfo();

  const bagIds = await waitUntilBagAvaiable(
    studioId,
    lesson.lessonId,
    interval
  );
  const bagId = chooseBag(bagIds, preferences);
  const authToken = await authenticate(email, password);
  await reserveLesson(authToken, lesson, bagId);

  let currentBagId = bagId;
  while (preferences.indexOf(currentBagId) !== 0) {
    await sleep(5000);
    currentBagId = await moveToBetterBox(
      studioId,
      lesson,
      currentBagId,
      preferences,
      5000
    );
  }
}

async function moveToBetterBox(
  studioId,
  lesson,
  currentBagId,
  preferences,
  interval
) {
  const nextBagIds = await waitUntilBagAvaiable(
    studioId,
    lesson.lessonId,
    interval
  );
  const nextBagId = chooseBag(nextBagIds, preferences);

  const nextIndex = preferences.indexOf(nextBagId);
  const currentIndex = preferences.indexOf(currentBagId);

  if (nextIndex !== -1 && nextIndex < currentIndex) {
    const authToken = await authenticate(email, password);
    await moveBag(authToken, lesson.lessonId, currentBagId, nextBagId);
    return nextBagId;
  }

  return currentBagId;
}

main();
