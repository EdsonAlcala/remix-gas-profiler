import { addHexPrefix } from 'ethereumjs-util';
import * as _ from "lodash";

const BASIC_ADDRESS_REGEX = /^(0x)?[0-9a-f]{40}$/i;
const SAME_CASE_ADDRESS_REGEX = /^(0x)?([0-9a-f]{40}|[0-9A-F]{40})$/;
const ADDRESS_LENGTH = 40;

export const padZeros = (address: string): string => {
    return addHexPrefix(_.padStart(stripHexPrefix(address), ADDRESS_LENGTH, '0'));
}

export const isHexPrefixed = (str: string) => {
    if (typeof str !== 'string') {
        throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
    }
    return str.slice(0, 2) === '0x';
}

export const stripHexPrefix = (str: string) => {
    if (typeof str !== 'string') {
        return str;
    }
    return isHexPrefixed(str) ? str.slice(2) : str;
}