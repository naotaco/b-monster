const dayjs = require("dayjs");

function getDateList() {
  const today = dayjs();
  const result = [
    today,
    today.add(1, "day"),
    today.add(2, "day"),
    today.add(3, "day"),
    today.add(4, "day"),
    today.add(5, "day")
  ];

  return result;
}

module.exports = getDateList;
