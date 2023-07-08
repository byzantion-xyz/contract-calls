export const parseCrypto = (num, chain) => {
  switch(chain) {
    case "aptos":
      return parseInt((100000000 * num).toFixed(0))
    case "sui":
      return parseInt((1000000000 * num).toFixed(0))
  }
}
