const logger = require("./logger");

const axios = require("axios");
const { JSDOM } = require("jsdom");

async function reserveLesson(authToken, lesson, bagId) {
  logger(`${bagId}番のバッグを予約します`);
  const onetimeToken = await fetchOnetimeToken(authToken, lesson, bagId);

  logger(`予約開始...`);
  const res = await axios.post(
    `https://www.b-monster.jp/api/reservation/${lesson.lessonId}/reserve`,
    `onetime_token=${onetimeToken}&no_and_members=[{"no":"${bagId}"}]&pay_in_cash=&use_ticket=&rental_item_code=`,
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
  logger(
    `${lesson.time} ${lesson.instructor} ${
      lesson.mode
    } ${bagId}番のバッグの予約が完了しました！`
  );

  return res;
}

async function fetchOnetimeToken(authToken, lesson, bagId) {
  logger("ワンタイムトークン取得中...");
  const res = await axios.get(
    // b-monster側のバグでstudioCodeにlessonIdが入っているが、怪しまれないようにそのままlessonIdを入れておく
    `https://www.b-monster.jp/reserve/confirm?lesson_id=${
      lesson.lessonId
    }&studio_code=${lesson.lessonId}&punchbag=${bagId}`,
    {
      headers: {
        cookie: `auth_token_web=${authToken};`
      }
    }
  );

  const dom = new JSDOM(res.data);
  const token = dom.window.document.querySelector("[name=one_time_token]");

  logger("ワンタイムトークン:", token.value);
  return token.value;
}

module.exports = reserveLesson;
