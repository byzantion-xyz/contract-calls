export const addLeadingZerosAfter0x = (str) => {
  const [hexString, ...restOfType] = str.split("::")
  return `0x${hexString.replace('0x', '').padStart(64, '0')}::${restOfType.join("::")}`
}