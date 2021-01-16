import { Router } from 'express';

const whoamIRouter = Router();
const path = '/whoami';
whoamIRouter.get(`${path}`, (request, response) => {
  return response.json("OK");
});

export default whoamIRouter;
