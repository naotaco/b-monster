const logger = require("./logger");

const axios = require("axios");

const TOKEN_LENGTH = 64;
const TOKEN_KEY_LENGTH = "auth_token_web=".length;

async function authenticate(email, password) {
  logger("ログイン");
  const res = await axios.post(
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

  logger("ログインに成功しました");
  return authToken;
}

module.exports = authenticate;
