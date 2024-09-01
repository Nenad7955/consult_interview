import { BaseRepository } from "./baseRepository.js"

export class AssetRepository extends BaseRepository {
  async create(
    ticker, 
    address,
  ){
    return await this.prisma.asset.create({
      data: {
        ticker: ticker,
        contract_address: address
      }
    })
  }

  async findById(id) {
    return await this.prisma.asset.findUnique({
      where: {
        asset_id: id
      }
    })
  }

}
