import { Pipe, PipeTransform } from '@angular/core';

/*
 * Replaces newlines with <br> tags
*/
@Pipe({name: 'nl2br'})
export class Nl2brPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value === "undefined") {
      return "";
    } else {
      return value.replace(/\n/g, "<br />");
    }
  }
}
