import dayjs from 'dayjs';

export default class Logger {
  public log(...args: string[]) {
    console.log(dayjs().format('YYYY/MM/DD HH:MM ss秒'), ...args);
  }
}
