import { PositionType } from "@prisma/client";
import { makeApi } from "@zodios/core";
import { z } from "zod";

const requestTemplate = z.object({
  amount_token: z.number(),
  asset_id: z.string(),
  user_id: z.string(),
  position_type: z.nativeEnum(PositionType),
})

const responseTemplate = z.object({
  "status": z.string(),
})


export const api = makeApi([
  {
    method: "post",
    path: "/position/open",
    alias: "openPosition",
    description: "Open a long or short position",
    parameters: [{
      name: 'body',
      type: 'Body',
      schema: requestTemplate,
      description: "Body",
    }],
    response: responseTemplate,
    error: z.object({})
  },
  {
    method: "post",
    path: "/position/close",
    alias: "closePosition",
    description: "Close a long or short position",
    parameters: [{
      name: 'body',
      type: 'Body',
      schema: requestTemplate,
      description: "Body",
    }],
    response: responseTemplate,
    error: z.object({})
  },
])
