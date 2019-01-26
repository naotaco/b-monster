const logger = require("./logger");

const axios = require("axios");
const { JSDOM } = require("jsdom");

const TOKEN_LENGTH = 64;
const TOKEN_KEY_LENGTH = "auth_token_web=".length;

class LessonReserver {
  constructor(studioCode, lessonId, interval = 5000) {
    this.logger = logger;
    this.httpClient = axios.create({
      withCredentials: true,
      headers: {
        Connection: "keep-alive"
      }
    });
    this.studioCode = studioCode;
    this.lessonId = lessonId;
    this.interval = interval;
  }

  async signIn(email, password) {
    logger("Sign in");
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
    logger("Sign in success");
    return res.data;
  }

  async sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
  }

  async waitUntilBagAvaiable() {
    logger("Wait until bag avaiable...");
    let ids = await this.fetchAvailableBagIds();

    while (ids.length === 0) {
      await this.sleep(this.interval)
      ids = await this.fetchAvailableBagIds();
    }

    return ids[0];
  }

  async fetchAvailableBagIds() {
    logger("Fetch available bag ids...");
    const { data } = await this.httpClient.get(
      `https://www.b-monster.jp/reserve/punchbag?lesson_id=${
        this.lessonId
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

    logger("Available bag ids:", availabledIds.join(","));

    return availabledIds;
  }

  async fetchOnetimeToken(bagId) {
    logger("Fetch one-time token");
    const res = await this.httpClient.get(
      // b-monster側のバグでstudioCodeにlessonIdが入っているが、怪しまれないようにそのままlessonIdを入れておく
      `https://www.b-monster.jp/reserve/confirm?lesson_id=${
        this.lessonId
      }&studio_code=${this.lessonId}&punchbag=${bagId}`,
      {
        headers: {
          cookie: `auth_token_web=${this.authToken};`
        }
      }
    );

    const dom = new JSDOM(res.data);
    const token = dom.window.document.querySelector("[name=one_time_token]");

    logger("One-time token:", token.value);
    return token.value;
  }

  async reserve(bagId) {
    logger(`Reservation start -- BagId ${bagId}`);
    const onetimeToken = await this.fetchOnetimeToken(bagId);

    logger(`Reserving BagId ${bagId}...`);
    return this.httpClient.post(
      `https://www.b-monster.jp/api/reservation/${this.lessonId}/reserve`,
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
  }
}

module.exports = LessonReserver;
