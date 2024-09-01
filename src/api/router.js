import { zodiosRouter } from "@zodios/express";

import { api } from "./api.js"


export class Router {
  constructor(positionService) {
    this.positionService = positionService
    this.router = zodiosRouter(api)

    this.router.post("/position/open", async (req, res, next) => {
      const resp = await this.positionService.open(req.body.position_type, req.body.user_id, req.body.asset_id, req.body.amount_token)
      console.log("resp", resp)

      res.status(resp[0]).json(this.response(resp[0], resp[1]))
    })

    this.router.post("/position/close", async (req, res) => {
      const resp = await this.positionService.close(req.body.position_type, req.body.user_id, req.body.asset_id, req.body.amount_token)
      console.log("resp", resp)

      res.status(resp[0]).json(this.response(resp[0], resp[1]))
    })
  }

  getRouter() {
    return this.router
  }

  response(code, respMessage) {
    let response = {}
    
    if (code > 300) {
      response['status'] = 'NOT OK'
      response['message'] = respMessage
    } else {
      response['status'] = 'OK'
    }

    return response
  }
}
