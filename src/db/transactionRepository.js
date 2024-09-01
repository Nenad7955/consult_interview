import { BaseRepository } from "./baseRepository.js"
import { currentTimestamp } from "../utils/timestamp.js"
import { StatusType } from "@prisma/client"

export class TransactionRepository extends BaseRepository {
  async create(
    userId,
    assetId,
    transaction_type,
    position_type,
    status,
    dexId,
    amount_token,
    quote_amount,
    platform_balance_before,
    platform_balance_after,
  ) {
    return await this.prisma.transaction.create({
      data: {
        user: {connect: { client_id: userId }},
        asset: {connect: { asset_id: assetId }},
        transaction_type: transaction_type,
        position_type: position_type,
        status: status,
        dex_transaction_id: dexId,
        amount_token: amount_token,
        quote_amount: quote_amount,
        platform_balance_before: platform_balance_before,
        platform_balance_after: platform_balance_after,
        date: currentTimestamp(),
      }
    })
  }

  async updateStatus(transactionId, newStatus, dexTransactionId) {
    await this.prisma.transaction.update({
      where: {
        transaction_id: transactionId
      },
      data: {
        status: {
          set: newStatus
        },
        dex_transaction_id: {
          set: dexTransactionId
        },
      }
    })
  }
  
  async getSumOfPositions(positionType, userId, assetId) {
    return await this.prisma.transaction.groupBy({
      by: ["user_id", "asset_id", "position_type"],
      where: {
        position_type: positionType,
        user_id: userId,
        asset_id: assetId,
        status: StatusType.successful,
      },
      _sum: {
        amount_token: true
      }
    })

  }
}
