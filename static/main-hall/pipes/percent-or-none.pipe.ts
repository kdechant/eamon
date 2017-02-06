import { Pipe, PipeTransform } from '@angular/core';

/**
 * Takes a number and adds a percent sign, or outputs "none" if the percentage is zero
 */
@Pipe({name: 'percentOrNone'})
export class PercentOrNonePipe implements PipeTransform {
  transform(input: string): string {
    let n = parseFloat(input);
    if (n === 0 || isNaN(n)) {
      return 'none';
    } else {
      return n + "%";
    }
  }

}
