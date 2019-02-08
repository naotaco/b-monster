import axios, { AxiosInstance } from 'axios';
import { JSDOM } from 'jsdom';
import Lesson from '~/Lesson';
import Logger from '~/logger';

const TOKEN_LENGTH = 64;
const TOKEN_KEY_LENGTH = 'auth_token_web='.length;

export default class LessonReserver {
  private httpClient: AxiosInstance;
  private authToken: string | null = null;

  constructor(
    private readonly studioCode: string,
    private readonly lesson: Lesson,
    private readonly interval: number = 5000,
    private readonly logger: Logger,
  ) {
    this.httpClient = axios.create({
      headers: {
        Connection: 'keep-alive',
      },
      withCredentials: true,
    });
  }

  public async signIn(email: string, password: string) {
    this.logger.log('ログイン');
    const res = await this.httpClient.post(
      'https://www.b-monster.jp/api/member/signin',
      `mail_address=${email}&password=${password}`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    );

    const authToken = res.headers['set-cookie'][0].substring(
      TOKEN_KEY_LENGTH,
      TOKEN_KEY_LENGTH + TOKEN_LENGTH,
    );
    this.authToken = authToken;
    this.logger.log('ログインに成功しました');
    return res.data;
  }

  public async sleep(msec: number) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }

  public async waitUntilBagAvaiable() {
    this.logger.log('バッグ取得開始...');
    let ids = await this.fetchAvailableBagIds();

    while (ids.length === 0) {
      await this.sleep(this.interval);
      ids = await this.fetchAvailableBagIds();
    }

    return ids[0];
  }

  public async fetchAvailableBagIds() {
    this.logger.log('予約可能なバッグをチェック中...');
    const { data } = await this.httpClient.get(
      `https://www.b-monster.jp/reserve/punchbag?lesson_id=${
        this.lesson.id
      }&studio_code=${this.studioCode}`,
    );
    const dom = new JSDOM(data);
    const bags = dom.window.document.querySelectorAll(
      'label.bag-check:not(.hidden)>input:not([disabled=disabled])',
    );

    const availabledIds: number[] = [];
    bags.forEach((bag) => {
      availabledIds.push(Number(bag.id.substring(3)));
    });

    if (availabledIds.length > 0) {
      this.logger.log('予約可能なバッグ:', availabledIds.join(','));
    } else {
      this.logger.log('予約可能なバッグはありませんでした');
    }

    return availabledIds;
  }

  public async fetchOnetimeToken(bagId: number): Promise<string> {
    this.logger.log('ワンタイムトークン取得中...');
    const res = await this.httpClient.get(
      // b-monster側のバグでstudioCodeにlessonIdが入っているが、怪しまれないようにそのままlessonIdを入れておく
      `https://www.b-monster.jp/reserve/confirm?lesson_id=${
        this.lesson.id
      }&studio_code=${this.lesson.id}&punchbag=${bagId}`,
      {
        headers: {
          cookie: `auth_token_web=${this.authToken};`,
        },
      },
    );

    const dom = new JSDOM(res.data);
    const token: Element | null = dom.window.document.querySelector(
      '[name=one_time_token]',
    );

    if (token === null) {
      throw new Error('ワンタイムトークンの取得に失敗しました');
    }

    const value = token.getAttribute('value');

    if (value === null) {
      throw new Error('ワンタイムトークンの取得に失敗しました');
    }

    this.logger.log('ワンタイムトークン: ', value);
    return value;
  }

  public async reserve(bagId: number) {
    this.logger.log(`${bagId}番のバッグを予約します`);
    const onetimeToken = await this.fetchOnetimeToken(bagId);

    this.logger.log(`予約開始...`);
    const res = this.httpClient.post(
      `https://www.b-monster.jp/api/reservation/${this.lesson.id}/reserve`,
      `onetime_token=${onetimeToken}&no_and_members=[{"no":"${bagId}"}]&pay_in_cash=&use_ticket=&rental_item_code=`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'cookie': `auth_token_web=${this.authToken};`,
        },
      },
    );
    this.logger.log(
      `${this.lesson.time} ${this.lesson.instructor} ${
        this.lesson.mode
      } ${bagId}番のバッグの予約が完了しました！`,
    );

    return res;
  }
}

module.exports = LessonReserver;
