const logger = require("./logger");

const axios = require("axios");

async function cancelLesson(authToken, lessonId, bagId) {
  logger(`${bagId}番のバッグをキャンセルします`);

  const res = axios.put(
    `https://www.b-monster.jp/api/reservation/${
      lessonId
    }/cancel`,
    `lesson_id=${lessonId}&no_list=${JSON.stringify([bagId])}`,
    {
      headers: {
        cookie: `auth_token_web=${authToken};`,
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest"
      }
    }
  );
  logger(`${bagId}番のバッグをキャンセルしました！`);

  return res;
}

module.exports = cancelLesson;
