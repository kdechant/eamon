import { Pipe, PipeTransform } from '@angular/core';
import {Game} from "../models/game";

/**
 * Replaces template tags with the variables.
 * This allows descriptions in the database to include things like the adventurer's name.
 *
 * Note: race conditions can prevent this from working. Always use inside an
 * *ngIf="game" block or it might now
 */
@Pipe({name: 'gamevars'})
export class GameVarsPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value === "undefined") {
      return "";
    } else {
      let game = Game.getInstance();
      if (game.player) {
        return value.replace("{{name}}", game.player.name);
      }
      return value;
    }
  }
}
