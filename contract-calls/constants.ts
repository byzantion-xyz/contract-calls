export const tradeportBeneficiaryAddress = '0xbca3b5c01c8d1a93aed3a036feff45145518292dd3c1db1d67cc99a699a7b517'
export const tradeportDefaultFeeBps = 150
export const tradeportDefaultFeeDenominator = 10000
export const tradeportListingStore = "0x47cba0b6309a12ce39f9306e28b899ed4b3698bce4f4911fd0c58ff2329a2ff6"
export const tradeportBiddingStore = "0x3d3b0c6e616fdc1a45b2b73d022bc085448e78bd729d28081c7a340abb33cba1"
export const tradeportMarketplaceObject = "0xc5f87120e388b532ee774f7bac23347679f632a1f2d59f4ed2bbf2ffe5a61b6f"

export const tradeportKioskListingStore = "0xbff3161b047fb8b727883838c09b08afa9e0dd0f5488bde9e99e80643da9b9e0"
export const tradeportKioskBiddingStore = "0x1e5e7f38e3a61d1d189506d0fc6b7e47e935a292d9e1b23c0f3f1c0f94227772"
export const tradeportKioskBiddingEscrowKiosk = "0x151fbe627d3f8de855f424c879ea2176d89282185a4b9226a7157172dd2919cc"
export const collectionIdsToUseKioskListingContract = [
  "de36d429-35aa-412f-9762-ceea83ae320a", // bullsharks
  "83dfd29a-5e2b-4494-b98a-9c24bd2ae147", // bruce lee
  "7577f48c-edc9-4318-b168-b5d87c91e771", // suiNS Day
  "f7ccba9d-04f8-49c4-8e1f-d264b122584d" // capys
]
export const collectionIdsToNotUseForKioskContractCollectionBidding = [
  "f7ccba9d-04f8-49c4-8e1f-d264b122584d" // capys
]

export const collectionIdsWithZeroCommission = [
  "4827d37b-5574-404f-b030-d26912ad7461" // fuddies
]

export const originByteAllowListObject = "0xb9353bccfb7ad87b9195c6956b2ac81551350b104d5bfec9cf0ea6f5c467c6d1"
export const suishiOriginByteAllowListObject = "0xa9afd6ac0b5a68710992ebc145b9be4e764628dfffebbccb065ed891948f7d7c"
export const fuddiesOriginByteAllowListObject = "0x1ae174e8e2f238648d5fbef41e2b435b7285e678aa5e2e7db27f1be006ab242c"

export const bluemoveMarketConfigObject = "0x09e24b156b08e7bc5272f9b731e93b80b458f0b79a5195eb81a471d514f1b1b8"
export const bluemoveRoyaltyCollectionObject = "0xbf471e4f38f76ed88f18e44f3dce2c27e03c1857d51ea17cd9b230b6d69b4bc1"
export const bluemoveCreatorConfigObject = "0x6bdeb62b036f5f9c3f0587a0480e6dd75cb4e758660cf30b542c031fa394bb83"
export const bluemoveOfferDataObject = "0x4a8e6a4634e3dedae00ffe9f065351664ba32d7e9c2d26221a666ca380ea68b9"
export const bluemoveOfferCollectionDataObject = "0xd1def3ba244a0cb3d248cd3e72078cae869c05b4f03ccc9289998188b1d7b768"
export const bluemoveKioskMarketplaceKioskObject = "0x7ffb33136bcf4a69fefd9b962c5e47f9213c79cf4f443dd2a39ab17a1424ba6f"
export const bluemoveKioskOfferCollectionDataObject = "0xd29edb24787f6b128018de0a2a513cdf63a48f7c256ecad1186cba3c6a45cb55"
export const bluemoveKioskOfferCollectionBidderBag = "0x15708d74504203a9620779583f8e63f2b5a599b28dd3a7d9063ab41e6fb75942"

export const souffl3MarketplaceObject = "0x0ad62c9d9c5b06b60c1f2e7da6659f7408636c11392651444dfdc5f5930d5dce"
export const souffl3VersionObject = "0x2c012a80a7fab8fe025d3d5be531227ccebbaa86d85cb56d09d235b1f3209cef"
export const souffl3ExtensionObject = "0xa3e5b249961bae7270af1484687b7d924d6364476119f687564dba0530055e6f"

export const souffl3GenericBuyMethodCollections = [
  "f7ccba9d-04f8-49c4-8e1f-d264b122584d",
  "86a437d7-e073-4365-8455-a4f2d983f840",
  "d8863069-7281-4809-b66c-30bb80d47967",
  "f447de12-64f1-490a-b8e5-636d4e778a61",
  "f6cf1905-8378-44c5-98aa-ef6b20d0a527",
  "19569440-6dfb-42af-8189-59fff6fa9905",
]

export const keepsakeMarketplaceObject = "0x08f446892306164934c0622388d8220961a9d08bc143888b6c923bb97a179ea8"
export const keepsakeMarketplaceKiosk = "0xfaf1b99c273737e914da13324ee1191f42346643083892d3f6f09a2d246967e5"

export const tocenMarketplaceObject = "0xb2b140b2841329320b66f92373a2683af7f9066472233effab03755270bcf65f"

export const hyperspaceTransferPolicy = "0xb419035c773d944268d64ef8a271fc52700d9277ad118f24b3de78a37a8bf899"
export const hyperspaceMpTransferPolicy = "0xc38ba43a611f1571d78bffd3e85e6137d77e30a76f735c93821b24971b82619f"
export const hyperspaceTransferPolicyType = "0x9a84b6a7914aedd6741e73cc2ca23cbc77e22ed3c5f884c072a51868fedde45b::hyperspace::Hyperspace"
export const hyperspaceMpTransferPolicyType = "0x9a84b6a7914aedd6741e73cc2ca23cbc77e22ed3c5f884c072a51868fedde45b::hyperspace_mp::Hyperspace_mp"
export const collectionIdsThatRequireKioskLocking = [
  "de36d429-35aa-412f-9762-ceea83ae320a", // bullsharks
  "83dfd29a-5e2b-4494-b98a-9c24bd2ae147", // bruce lee
  "f7ccba9d-04f8-49c4-8e1f-d264b122584d", // capys
]

export const originByteMarketplaces = [
  "tradeport",
  "clutchy",
  "bluemove",
  "hyperspace",
  "somis"
]