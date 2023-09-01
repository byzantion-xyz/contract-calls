import { getSuiSharedObjects } from "../utils/getSuiSharedObjects";
import { SuiTxBlock } from "./SuiTxBlock";

export const claimTradeHoldSui = async ({
  nft,
  nftContract,
  suiSignAndExecuteTransactionBlock
}) => {
  const txBlock = new SuiTxBlock()

  const {
    orderbook,
    transferPolicy,
    royaltyStrategy,
    allowList
  } = await getSuiSharedObjects(nftContract)

  txBlock.moveCall({
    target: "0x004abae9be1a4641de72755b4d9aedb1f083c8ecb86c7a5b6546a0e6912d7c18::orderbook::finish_trade",
    arguments: [
      txBlock.object(orderbook),
      txBlock.object(nft?.chain_state?.claimable_trade_id),
      txBlock.object(nft?.chain_state?.claimable_seller_kiosk),
      txBlock.object(nft?.chain_state?.claimable_buyer_kiosk),
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })
  txBlock.incrementTotalTxsCount()

  txBlock.moveCall({
    target: "0x353c4070df66f1e9d8542a621844765170338e633bdbaf37331f5c89c85a6968::transfer_allowlist::confirm_transfer",
    arguments: [
      txBlock.object(allowList),
      {
        kind: "Result",
        index: txBlock.getTotalTxsCount() - 1
      },
    ],
    typeArguments: [
      nftContract?.properties?.nft_type
    ]
  })
  txBlock.incrementTotalTxsCount()


  if (royaltyStrategy) {
    txBlock.moveCall({
      target: "0x353c4070df66f1e9d8542a621844765170338e633bdbaf37331f5c89c85a6968::royalty_strategy_bps::confirm_transfer",
      arguments: [
        txBlock.object(royaltyStrategy),
        {
          kind: "Result",
          index: txBlock.getTotalTxsCount() - 2
        },
      ],
      typeArguments: [
        nftContract?.properties?.nft_type,
        "0x2::sui::SUI"
      ]
    })
    txBlock.incrementTotalTxsCount()
  }

  txBlock.moveCall({
    target: "0xb2b8d1c3fd2b5e3a95389cfcf6f8bda82c88b228dff1f0e1b76a63376cbad7c6::transfer_request::confirm",
    arguments: [
      {
        kind: "Result",
        index: royaltyStrategy ? txBlock.getTotalTxsCount() - 3 : txBlock.getTotalTxsCount() - 2
      },
      txBlock.object(transferPolicy),
    ],
    typeArguments: [
      nftContract?.properties?.nft_type,
      "0x2::sui::SUI"
    ]
  })

  return await suiSignAndExecuteTransactionBlock({ 
    transactionBlock: txBlock,
    nftTokenId: nft?.token_id
  })
}