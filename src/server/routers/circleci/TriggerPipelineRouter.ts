import { Router } from 'express';
import * as CircleCI from '../../lib/circleci/';
// import { circleCIClientService } from '../../lib/circleci/';
// import circleCIClientService  from '../../lib/circleci/CircleCIClient';
const triggerPipelineRouter = Router();
const path = '/trigger-pipeline';

triggerPipelineRouter.post(`${path}`, (request, response) => {
  /* let JSONdataForResponse = {
    message : "OK", // user property is there just because it is required by the [views/layout.ejs] template
    circleCiJsonResponse: {}
  }

  response.json(JSONdataForResponse);*/
  let git_repo = {
    name: "svelte-workshop",
    branch: `develop`
  }
  let pipelineConfig = {
    parameters: {
     gio_action: `release`, // should be releated to cicd_stage...? mvn_release ?
     dry_run: true,
     secrethub_org: process.env.SECRETHUB_ORG,
     secrethub_repo: process.env.SECRETHUB_REPO,
     maven_profile_id: process.env.MAVEN_PROFILE_ID
    },
    branch: `${git_repo.branch}`
  }
  let triggerPipelineSubscription = CircleCI.circleCIClientService.triggerCciPipeline(process.env.GH_ORG!, `${git_repo.name}`, `${git_repo.branch}`, pipelineConfig).subscribe({
  next: (circleCiJsonResponse: any) : void => {
    console.info( '[{Ghallagher[/trigger-pipeline] Router}] - received Circle CI API Response [data] => ', circleCiJsonResponse  /* circleCiJsonResponse.data // when retryWhen is used*/ )
    let entry: any = {};
    entry.pipeline = {
      pipeline_exec_number: `${circleCiJsonResponse.number}`,
      id : `${circleCiJsonResponse.id}`,
      created_at: `${circleCiJsonResponse.created_at}`,
      exec_state: `${circleCiJsonResponse.state}`,
      project_slug: `${circleCiJsonResponse.project_slug}`
    }
    let JSONdataForResponse = {
      message : "[{Ghallagher[/trigger-pipeline] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
      circleCiJsonResponse: circleCiJsonResponse
    }
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = 204;
    response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
  },
  complete: (data: any) => {
     console.log( '[{[Ghallagher[/trigger-pipeline] Router]} - triggering Circle CI Build successfully completed :)]');
  },
  error: (catched_error: any) => {
     console.log( '[{[Ghallagher[/trigger-pipeline] Router]} - triggering Circle CI Build failed!!!]')
     let JSONErrorDataForResponse: any = {
       message: '[{[Ghallagher[/trigger-pipeline] Router]} - triggering Circle CI Build failed!!!]',
       error: {
         http_response: catched_error.axios_error.response,
         status_code: catched_error.cci_http_response_status.status_code,
         status_text: catched_error.cci_http_response_status.status_text
       }
     };
     JSONErrorDataForResponse = {
       message: `[{[Ghallagher[/trigger-pipeline] Router]} - triggering Circle CI Build failed!!!]`,
       cci_message: catched_error.axios_error.response.data.message,
       cci_status_code: catched_error.cci_http_response_status.status_code,
       cci_status_text: catched_error.cci_http_response_status.status_text
     };
     console.log( '[{[Ghallagher[/trigger-pipeline] Router]} - JSONErrorDataForResponse is : ]');
     console.log(JSONErrorDataForResponse);
     response.setHeader('Content-Type', 'application/json');
     response.statusCode = catched_error.cci_http_response_status.status_code;
     response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
  }
});
});

export default triggerPipelineRouter;
