
import { BaseRepository } from "./baseRepository.js"

export class ClientRepository extends BaseRepository {
  async create(
    name,
    balance_quote,
    balance_tokens,
  ){
    return await this.prisma.client.create({
      data: {
        name: name,
        balance_quote: balance_quote,
        balance_tokens: balance_tokens,
      }
    })
  }

  async findById(userID) {
    return await this.prisma.client.findUnique({
      where: {
        client_id: userID
      }
    })
  }

  async updateBalances(user_id, solAmount, tokens) {
    return await this.prisma.client.update({
      where: {
        client_id: user_id,
      },
      data: {
        balance_quote: {
          decrement: solAmount
        },
        balance_tokens: {
          increment: tokens //i hope i got this right, we trade sol -> tokens
        }
      },
    })
  }
}
