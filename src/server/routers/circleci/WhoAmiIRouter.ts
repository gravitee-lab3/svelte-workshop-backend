import { Router } from 'express';

const whoamIRouter = Router();
const path = '/whoami';
whoamIRouter.get(`${path}`, (request, response) => {
  let JSONdataForResponse = {
    message : "OK", // user property is there just because it is required by the [views/layout.ejs] template
    circleCiJsonResponse: {}
  }
  return response.json(JSONdataForResponse);
});

export default whoamIRouter;
