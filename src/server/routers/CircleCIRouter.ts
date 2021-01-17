import { Router } from 'express';

import whoamIRouter from './circleci/WhoAmiIRouter';

const circleciRouter = Router();

circleciRouter.use('/circleci', whoamIRouter);

export default circleciRouter;
