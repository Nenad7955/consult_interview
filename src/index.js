import { serve, setup } from "swagger-ui-express";
import { openApiBuilder, bearerAuthScheme } from "@zodios/openapi";

import { PrismaClient } from '@prisma/client'
import { zodiosApp } from "@zodios/express";
import { config } from "dotenv";

import { AssetRepository, ClientRepository, PlatformBalanceRepository, TransactionRepository } from './db/index.js';
import { PositionService } from './services/position.js';
import { Router } from "./api/router.js"
import { api } from "./api/api.js";

config();

export const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient({})
const assetRepository = new AssetRepository(prisma)
const clientRepository = new ClientRepository(prisma)
const transactionRepository = new TransactionRepository(prisma)
const platformRepository = new PlatformBalanceRepository(prisma)

const positionService = new PositionService(prisma, clientRepository, assetRepository, platformRepository, transactionRepository)

async function bean() {
  console.log("asset", (await assetRepository.create("123", "123")).asset_id)
  console.log("client", (await clientRepository.create("name", 1000, 1000)).client_id)
  console.log("balance", (await platformRepository.create(1000, 1000)).balance_id)
}

// bean()

const router = new Router(positionService)

const app = zodiosApp(); // just an axpess app with type annotations
app.use(router.getRouter())

const document = openApiBuilder({
  title: "API",
  version: "1.0.0",
  description: "API",
})
  .addServer({ url: "localhost" })
  .addPublicApi(api)
  .build();

app.use(`/docs/swagger.json`, (_, res) => res.json(document));
app.use("/docs", serve);
app.use("/docs", setup(undefined, { swaggerUrl: "/docs/swagger.json" }));

app.listen(PORT)
