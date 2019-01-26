function logger(...args) {
  console.log(formatDate(new Date()), ...args);
}
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  hours = d.getHours();
  minutes = d.getMinutes();
  seconds = d.getSeconds();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  if (seconds < 10) seconds = "0" + seconds;

  return `${year}/${month}/${day} ${hours}:${minutes} ${seconds}s`;
}

module.exports = logger;
