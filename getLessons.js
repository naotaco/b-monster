const axios = require("axios");
const { JSDOM } = require("jsdom");

async function getLessons(date, studioId) {
  let url = `https://www.b-monster.jp/reserve/?studio_code=${studioId}`;
  if (studioId == "0004"){
    url = `https://www.b-monster.jp//reserve/?studio_code=0004&room_id=19`
  }

  const res = await axios.get(url);
  const dom = new JSDOM(res.data);
  const timeTable = dom.window.document.getElementById("time-table");
  const lessonColumns = timeTable.querySelectorAll(".flex-no-wrap");

  const matchedColumn = matchLessonColumns(lessonColumns, date);
  if (!matchedColumn) {
    return []
  }
  
  const lessons = buildLessons(matchedColumn);

  return lessons;
}

function matchLessonColumns(lessonColumns, date) {
  const dateText = date.format("M月D日");
  for (const column of lessonColumns) {
    const columnDateText = column.querySelector("h3.smooth-text").textContent;

    if (columnDateText.startsWith(dateText)) {
      return column;
    }
  }

  return null;
}

function buildLessons(lessonColumn) {
  const lessonDivs = lessonColumn.querySelectorAll(".panel:not(.done)");

  const result = [];
  for (const div of lessonDivs) {
    const lesson = buildLesson(div);
    if (lesson.mode !== "STREAM ONLY" && lesson.mode !== "無料体験会")
      result.push(lesson);
  }

  return result;
}

function buildLesson(div) {
  const time = div.querySelector(".tt-time") ? div.querySelector(".tt-time").textContent : "";
  const instructor = div.querySelector(".tt-instructor") ? div.querySelector(".tt-instructor").textContent : "";
  const mode = div.querySelector(".tt-mode") ? div.querySelector(".tt-mode").getAttribute("data-program") : "";

  const link = div.querySelector("a") ? div.querySelector("a").href : "";
  const lessonId = link.match(/lesson_id=(.+)&/)[1];

  return {
    time,
    instructor,
    mode,
    lessonId
  };
}

module.exports = getLessons;
