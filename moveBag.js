const logger = require("./logger");

const axios = require("axios");

async function moveBag(authToken, lessonId, previousBagId, nextBagId) {
  logger(`${previousBagId}番のバッグから${nextBagId}に変更します`);

  const res = axios.put(
    `https://www.b-monster.jp/api/reservation/${
      lessonId
    }/move`,
    `no=${previousBagId}&next_no=${nextBagId}`,
    {
      headers: {
        cookie: `auth_token_web=${authToken};`,
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
      }
    }
  );
  logger(`${nextBagId}番のバッグを予約しました！`);

  return res;
}

module.exports = moveBag;
