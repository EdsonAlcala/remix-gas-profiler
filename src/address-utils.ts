export const isHexPrefixed = (str: string) => {
  if (typeof str !== 'string') {
    throw new Error(
      "[is-hex-prefixed] value must be type 'string', is currently type " +
        typeof str +
        ', while checking isHexPrefixed.',
    )
  }
  return str.slice(0, 2) === '0x'
}

export const stripHexPrefix = (str: string) => {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}
