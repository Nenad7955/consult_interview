import { BaseRepository } from "./baseRepository.js"
import { currentTimestamp } from "../utils/timestamp.js"

export class PlatformBalanceRepository extends BaseRepository {
  async create(
    balance_tokens,
    balance_sol,
  ) {
    return await this.prisma.platformBalance.create({
      data: {
        balance_tokens: balance_tokens,
        balance_sol: balance_sol,
        last_updated: currentTimestamp(),
      }
    })
  }

  async decrementBalance(tokenAmount, solAmount) {
    //quick hack to skip where clause, since there is only 1 entry in this table
    return await this.prisma.platformBalance.updateMany({
      data: {
        balance_tokens: {
          decrement: tokenAmount
        },
        balance_sol: {
          decrement: solAmount,
        },
        last_updated: {
          set: currentTimestamp()
        }
      },
    })
  }

  async get() {
    return (await this.prisma.platformBalance.findMany())[0]
  }
}
