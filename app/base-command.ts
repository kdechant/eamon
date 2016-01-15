/**
 * Class BaseCommand.
 * Interface for commands a player can give.
 */
export interface BaseCommand {
  name: string;
  verbs: Array<string>;
  run(verb, arg);
}
