// ## twig.expression.operator.js
//
// This file handles operator lookups and parsing.
import { TwigCore } from "./twig.core.js";
import TwigError from "./TwigError.js";
import {twig} from "./twig.js";
import { twigFunctions } from "./TwigFunctions.js";

class TwigExpressionOperator {
    operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    containment(a, b) {
        if (b === undefined || b === null) {
            return null;
        }

        if (b.indexOf !== undefined) {
            // String
            return (a === b || a !== '') && b.includes(a);
        }

        let el;
        for (el in b) {
            if (Object.hasOwnProperty.call(b, el) && b[el] === a) {
                return true;
            }
        }

        return false;
    };

    lookup(operator, token) {
        switch (operator) {
            case '..':
                token.precidence = 20;
                token.associativity = this.operator.leftToRight;
                break;

            case ',':
                token.precidence = 18;
                token.associativity = this.operator.leftToRight;
                break;

            // Ternary
            case '?:':
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = this.operator.rightToLeft;
                break;

            // Null-coalescing operator
            case '??':
                token.precidence = 15;
                token.associativity = this.operator.rightToLeft;
                break;

            case 'or':
                token.precidence = 14;
                token.associativity = this.operator.leftToRight;
                break;

            case 'and':
                token.precidence = 13;
                token.associativity = this.operator.leftToRight;
                break;

            case 'b-or':
                token.precidence = 12;
                token.associativity = this.operator.leftToRight;
                break;

            case 'b-xor':
                token.precidence = 11;
                token.associativity = this.operator.leftToRight;
                break;

            case 'b-and':
                token.precidence = 10;
                token.associativity = this.operator.leftToRight;
                break;

            case '==':
            case '!=':
                token.precidence = 9;
                token.associativity = this.operator.leftToRight;
                break;

            case '<':
            case '<=':
            case '>':
            case '>=':
            case 'not in':
            case 'in':
                token.precidence = 8;
                token.associativity = this.operator.leftToRight;
                break;

            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = this.operator.leftToRight;
                break;

            case '//':
            case '**':
            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = this.operator.leftToRight;
                break;

            case 'not':
                token.precidence = 3;
                token.associativity = this.operator.rightToLeft;
                break;

            case 'matches':
                token.precidence = 8;
                token.associativity = this.operator.leftToRight;
                break;

            case 'starts with':
                token.precidence = 8;
                token.associativity = this.operator.leftToRight;
                break;

            case 'ends with':
                token.precidence = 8;
                token.associativity = this.operator.leftToRight;
                break;

            default:
                throw new TwigError('Failed to lookup operator: ' + operator + ' is an unknown operator.');
        }

        token.operator = operator;
        return token;
    };

    parse(operator, stack) {
        TwigCore.log.trace('Twig.expression.operator.parse: ', 'Handling ', operator);
        let a;
        let b;
        let c;

        if (operator === '?') {
            c = stack.pop();
        }

        b = stack.pop();
        if (operator !== 'not') {
            a = stack.pop();
        }

        if (operator !== 'in' && operator !== 'not in' && operator !== '??') {
            if (a && Array.isArray(a)) {
                a = a.length;
            }

            if (operator !== '?' && (b && Array.isArray(b))) {
                b = b.length;
            }
        }

        if (operator === 'matches') {
            if (b && typeof b === 'string') {
                const reParts = b.match(/^\/(.*)\/([gims]?)$/);
                const reBody = reParts[1];
                const reFlags = reParts[2];
                b = new RegExp(reBody, reFlags);
            }
        }

        switch (operator) {
            case ':':
                // Ignore
                break;

            case '??':
                if (a === undefined) {
                    a = b;
                    b = c;
                    c = undefined;
                }

                if (a !== undefined && a !== null) {
                    stack.push(a);
                } else {
                    stack.push(b);
                }

                break;
            case '?:':
                if (twig.lib.boolval(a)) {
                    stack.push(a);
                } else {
                    stack.push(b);
                }

                break;
            case '?':
                if (a === undefined) {
                    // An extended ternary.
                    a = b;
                    b = c;
                    c = undefined;
                }

                if (twig.lib.boolval(a)) {
                    stack.push(b);
                } else {
                    stack.push(c);
                }

                break;

            case '+':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a / b);
                break;

            case '//':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(Math.floor(a / b));
                break;

            case '%':
                b = parseFloat(b);
                a = parseFloat(a);
                stack.push(a % b);
                break;

            case '~':
                stack.push((typeof a !== 'undefined' && a !== null ? a.toString() : '') +
                          (typeof b !== 'undefined' && b !== null ? b.toString() : ''));
                break;

            case 'not':
            case '!':
                stack.push(!twig.lib.boolval(b));
                break;

            case '<':
                stack.push(a < b);
                break;

            case '<=':
                stack.push(a <= b);
                break;

            case '>':
                stack.push(a > b);
                break;

            case '>=':
                stack.push(a >= b);
                break;

            case '===':
                stack.push(a === b);
                break;

            case '==':
                /* eslint-disable-next-line eqeqeq */
                stack.push(a == b);
                break;

            case '!==':
                stack.push(a !== b);
                break;

            case '!=':
                /* eslint-disable-next-line eqeqeq */
                stack.push(a != b);
                break;

            case 'or':
                stack.push(twig.lib.boolval(a) || twig.lib.boolval(b));
                break;

            case 'b-or':
                stack.push(a | b);
                break;

            case 'b-xor':
                stack.push(a ^ b);
                break;

            case 'and':
                stack.push(twig.lib.boolval(a) && twig.lib.boolval(b));
                break;

            case 'b-and':
                stack.push(a & b);
                break;

            case '**':
                stack.push(a ** b);
                break;

            case 'not in':
                stack.push(!this.containment(a, b));
                break;

            case 'in':
                stack.push(this.containment(a, b));
                break;

            case 'matches':
                stack.push(b.test(a));
                break;

            case 'starts with':
                stack.push(typeof a === 'string' && a.indexOf(b) === 0);
                break;

            case 'ends with':
                stack.push(typeof a === 'string' && a.includes(b, a.length - b.length));
                break;

            case '..':
                stack.push(twigFunctions.range(a, b));
                break;

            default:
                throw new TwigError('Failed to parse operator: ' + operator + ' is an unknown operator.');
        }
    };
}

const twigExpressionOperator = new TwigExpressionOperator();
export {twigExpressionOperator};