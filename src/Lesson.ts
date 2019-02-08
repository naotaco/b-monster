export default class Lesson {
  constructor(
    public readonly instructor: string,
    public readonly id: string,
    public readonly mode: string,
    public readonly time: string,
  ) {}

  public get isReservable(): boolean {
    return this.mode !== 'STREAM ONLY' && this.mode !== '無料体験会';
  }
}
