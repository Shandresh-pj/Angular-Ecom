import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/

@Pipe({
  name: 'individualWord',
  standalone: true
})
export class IndividualWordPipe implements PipeTransform {
  transform(value: string): string {
    return value?value.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1"):''
  }
}