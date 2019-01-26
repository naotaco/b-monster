const logger = require("./logger");

const axios = require("axios");
const { JSDOM } = require("jsdom");

const TOKEN_LENGTH = 64;
const TOKEN_KEY_LENGTH = "auth_token_web=".length;

class LessonReserver {
  constructor(studioCode, lesson, interval = 5000) {
    this.logger = logger;
    this.httpClient = axios.create({
      withCredentials: true,
      headers: {
        Connection: "keep-alive"
      }
    });
    this.studioCode = studioCode;
    this.lesson = lesson;
    this.interval = interval;
  }

  async signIn(email, password) {
    logger("ログイン");
    const res = await this.httpClient.post(
      "https://www.b-monster.jp/api/member/signin",
      `mail_address=${email}&password=${password}`,
      {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );

    const authToken = res.headers["set-cookie"][0].substring(
      TOKEN_KEY_LENGTH,
      TOKEN_KEY_LENGTH + TOKEN_LENGTH
    );
    this.authToken = authToken;
    logger("ログインに成功しました");
    return res.data;
  }

  async sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  async waitUntilBagAvaiable() {
    logger("バッグ取得開始...");
    let ids = await this.fetchAvailableBagIds();

    while (ids.length === 0) {
      await this.sleep(this.interval);
      ids = await this.fetchAvailableBagIds();
    }

    return ids[0];
  }

  async fetchAvailableBagIds() {
    logger("予約可能なバッグをチェック中...");
    const { data } = await this.httpClient.get(
      `https://www.b-monster.jp/reserve/punchbag?lesson_id=${
        this.lesson.lessonId
      }&studio_code=${this.studioCode}`
    );
    const dom = new JSDOM(data);
    const bags = dom.window.document.querySelectorAll(
      "label.bag-check:not(.hidden)>input:not([disabled=disabled])"
    );

    const availabledIds = [];
    for (const bag of bags) {
      availabledIds.push(Number(bag.id.substring(3)));
    }

    if (availabledIds.length > 0) {
      logger("予約可能なバッグ:", availabledIds.join(","));
    } else {
      logger("予約可能なバッグはありませんでした");
    }

    return availabledIds;
  }

  async fetchOnetimeToken(bagId) {
    logger("ワンタイムトークン取得中...");
    const res = await this.httpClient.get(
      // b-monster側のバグでstudioCodeにlessonIdが入っているが、怪しまれないようにそのままlessonIdを入れておく
      `https://www.b-monster.jp/reserve/confirm?lesson_id=${
        this.lesson.lessonId
      }&studio_code=${this.lesson.lessonId}&punchbag=${bagId}`,
      {
        headers: {
          cookie: `auth_token_web=${this.authToken};`
        }
      }
    );

    const dom = new JSDOM(res.data);
    const token = dom.window.document.querySelector("[name=one_time_token]");

    logger("ワンタイムトークン:", token.value);
    return token.value;
  }

  async reserve(bagId) {
    logger(`${bagId}番のバッグを予約します`);
    const onetimeToken = await this.fetchOnetimeToken(bagId);

    logger(`予約開始...`);
    const res = this.httpClient.post(
      `https://www.b-monster.jp/api/reservation/${
        this.lesson.lessonId
      }/reserve`,
      `onetime_token=${onetimeToken}&no_and_members=[{"no":"${bagId}"}]&pay_in_cash=&use_ticket=&rental_item_code=`,
      {
        headers: {
          cookie: `auth_token_web=${this.authToken};`,
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );
    logger(
      `${this.lesson.time} ${this.lesson.instructor} ${
        this.lesson.mode
      } ${bagId}番のバッグの予約が完了しました！`
    );

    return res;
  }
}

module.exports = LessonReserver;
