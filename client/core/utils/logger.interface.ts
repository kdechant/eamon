export interface ILoggerService {
  log(type: string, value?: number);
}

/**
 * Dummy logger used with automated tests
 */
export class DummyLoggerService implements ILoggerService {

  public log(type: string = "", value: number = null) {
    // this logger class prints its log entries to the console. It doesn't save anything to the DB.
    console.log("Log: ", type, value);
  }

}
