import { originByteAllowListObject } from "../constants";
import { SuiTxBlock } from "./SuiTxBlock";

export const claimTradeHoldSui = async ({
  nft,
  nftContract,
  suiSignAndExecuteTransactionBlock
}) => {

  const txBlock = new SuiTxBlock()

  const orderbook = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("orderbook"))?.id

  const transferPolicy = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("transfer_policy"))?.id
  const royaltyStrategy = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("royalty_strategy_bps"))?.id
  let allowList = nftContract?.properties?.shared_objects?.find(o => o.type?.includes("allowlist"))?.id
  if (!allowList) allowList = originByteAllowListObject

  txBlock.moveCall({
    target: "0x5a162d3f3de6895c6de4be7a9ed75c170b79321668405bff2906869385e65c5c::orderbook::finish_trade",
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
    target: "0x77d0f09420a590ee59eeb5e39eb4f953330dbb97789e845b6e43ce64f16f812e::transfer_allowlist::confirm_transfer",
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
      target: "0x77d0f09420a590ee59eeb5e39eb4f953330dbb97789e845b6e43ce64f16f812e::royalty_strategy_bps::confirm_transfer",
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
    target: "0xe2c7a6843cb13d9549a9d2dc1c266b572ead0b4b9f090e7c3c46de2714102b43::transfer_request::confirm",
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

  return await suiSignAndExecuteTransactionBlock({ transactionBlock: txBlock })
}

