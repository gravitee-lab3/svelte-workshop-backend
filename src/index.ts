// import * as express from 'express'
import "./lib/env";
import "./lib/errors";
import GhallagherServer from './server/Server';
import circleciRouter from './server/routers/CircleCIRouter';
import cors from "cors";


const corsMiddleware = cors();
const server = new GhallagherServer({
  fqdn: `${process.env.GHALLAGHER_HOST}`,
  port: Number(process.env.GHALLAGHER_PORT),
  middleWares: [corsMiddleware], // will enable preflight requests options
  controllers: [
    {
      name: "Circle CI Router Controller",
      router: circleciRouter
    }
  ]
})
server.listen();
