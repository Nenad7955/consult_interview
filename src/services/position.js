import { PositionType, StatusType, TransactionType } from "@prisma/client"

export class PositionService {
  constructor(prisma, clientRepository, assetRepository, platformBalanceRepository, transactionRepository) {
    this.prisma = prisma
    this.clientRepository = clientRepository
    this.assetRepository = assetRepository
    this.platformBalanceRepository = platformBalanceRepository
    this.transactionRepository = transactionRepository
  }

  async open(positionType, userId, asset_id, solAmount) {
    const client = await this.clientRepository.findById(userId)
    if (client === undefined || client === null)
      // throw new CustomError(404, "User not found");
      return [404, "User not found"]

    const asset = await this.assetRepository.findById(asset_id)
    if (asset === undefined || asset === null)
      return [404, "Asset not found"]

    const balance = await this.platformBalanceRepository.get()
    if (balance.balance_sol < solAmount) {
      return [406, "Platform balance is less then amount specified"]
    }

    if (client.balance_quote < solAmount) {
      return [406, "User balance is less then amount specified"]
    }

    let tokenAmount = 0
    let dexId = "doesn't really matter"

    const trans = await this.transactionRepository.create(
      userId,
      asset.asset_id,
      TransactionType.open_position,
      positionType,
      StatusType.pending,
      dexId,
      solAmount,
      tokenAmount,
      balance.balance_sol,
      balance.balance_sol.minus(solAmount),
    )

    // try {
    //   [tokenAmount, dexId] = await raydiumService.buyTokens(amountSol);
    // } catch(e) {
    //   return [503, "Raydium purchase failed"]
    //   await this.transactionRepository.updateStatus(trans.transaction_id, StatusType.failed, dexId) //should also try/catch
    // }

    await this.prisma.$transaction(async (tx) => {
      this.platformBalanceRepository.decrementBalance(tokenAmount, solAmount)
      this.clientRepository.updateBalances(userId, solAmount, tokenAmount)
      this.transactionRepository.updateStatus(trans.transaction_id, StatusType.successful, dexId)
    })

    return [200, ""]
  }

  async close(
    positionType,
    userId, 
    assetId,
    solAmount,
  ) {
    const client = await this.clientRepository.findById(userId)
    if (client === undefined || client === null)
      // throw new CustomError(404, "User not found");
      return [404, "User not found"]

    const asset = await this.assetRepository.findById(assetId)
    if (asset === undefined || asset === null)
      return [404, "Asset not found"]

    const sumOfAmounts = (await this.transactionRepository.getSumOfPositions(
      positionType,
      userId, 
      assetId,
    ))[0]._sum.amount_token
    if (solAmount > sumOfAmounts)
      return [406, "Don't have that many positions"]

    const balance = await this.platformBalanceRepository.get()

    let tokenAmount = 0
    let dexId = "doesn't really matter"

    const trans = await this.transactionRepository.create(
      userId,
      asset.asset_id,
      TransactionType.close_position,
      positionType,
      StatusType.pending,
      dexId,
      -solAmount,
      -tokenAmount,
      balance.balance_sol,
      balance.balance_sol.plus(solAmount),
    )

    // try {
    //   [tokenAmount, dexId] = await raydiumService.buyTokens(amountSol);
    // } catch(e) {
    //   return [503, "Raydium purchase failed"]
    //   await this.transactionRepository.updateStatus(trans.transaction_id, StatusType.failed, dexId) //should also try/catch
    // }

    await this.prisma.$transaction(async (tx) => {
      this.platformBalanceRepository.decrementBalance(-tokenAmount, -solAmount)
      this.clientRepository.updateBalances(userId, -solAmount, -tokenAmount)
      this.transactionRepository.updateStatus(trans.transaction_id, StatusType.successful, dexId)
    })

    return [200, ""]
  }
}