import { Router } from 'express';

import whoamIRouter from './circleci/WhoAmiIRouter';
import triggerPipelineRouter from './circleci/TriggerPipelineRouter';
import getPipelinesRouter from './circleci/GetPipelinesRouter';
import getPipelinesOfAProjectRouter from './circleci/GetPipelinesOfAProjectRouter';


const circleciRouter = Router();

circleciRouter.use('/circleci', whoamIRouter);
circleciRouter.use('/circleci', triggerPipelineRouter);
circleciRouter.use('/circleci', getPipelinesRouter);
circleciRouter.use('/circleci', getPipelinesOfAProjectRouter);


export default circleciRouter;
