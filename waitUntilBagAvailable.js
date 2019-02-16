const logger = require("./logger");

const axios = require("axios");
const { JSDOM } = require("jsdom");

async function waitUntilBagAvaiable(studioCode, lessonId, interval) {
  logger("バッグ取得開始...");
  let ids = await fetchAvailableBagIds(studioCode, lessonId);

  while (ids.length === 0) {
    await sleep(interval);
    ids = await fetchAvailableBagIds(studioCode, lessonId);
  }

  return ids[0];
}

async function fetchAvailableBagIds(studioCode, lessonId) {
  logger("予約可能なバッグをチェック中...");
  const { data } = await axios.get(
    `https://www.b-monster.jp/reserve/punchbag?lesson_id=${lessonId}&studio_code=${studioCode}`
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

async function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, msec));
}

module.exports = waitUntilBagAvaiable;
