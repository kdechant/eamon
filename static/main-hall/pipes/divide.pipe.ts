import { Pipe, PipeTransform } from '@angular/core';

/**
 * Divides a number by another number, rounded down
*/
@Pipe({name: 'divide'})
export class DividePipe implements PipeTransform {
  transform(value: number, divisor: string): number {
    let dv = parseFloat(divisor);
    if (typeof value === "undefined" || dv === 0) {
      return NaN;
    } else {
      return Math.floor(value / dv);
    }
  }
}
