import { Router } from 'express';
/// import * as bodyParser from 'body-parser';
import * as CircleCI from '../../lib/circleci/';
import { TriggerPipelineJSonPayload } from './TriggerPipelineJSonPayload';
// import { circleCIClientService } from '../../lib/circleci/';
// import circleCIClientService  from '../../lib/circleci/CircleCIClient';
const triggerPipelineRouter = Router();
const path = '/trigger-pipeline';

triggerPipelineRouter.post(`${path}`, (request, response) => {
  /* let JSONdataForResponse = {
    message : "OK", // user property is there just because it is required by the [views/layout.ejs] template
    emittedJSONwithCciResponse: {}
  }

  response.json(JSONdataForResponse);*/

  // Ok,with body_parser middleware I get in request.body the desired JSON contianing all the data I want :
  /*
  export JSON_PAYLOAD="{
      \"github_org\": \"${ORG_NAME}\",
      \"git_repo\": {
        \"name\": \"${REPO_NAME}\",
        \"branch\": \"${BRANCH}\"
      },
      \"parameters\":

      {
          \"gio_action\": \"release\"
      }

  }"
  */
  console.info( '[{Ghallagher[/trigger-pipeline] Router}] - received Circle CI API Response [data] => ', request.body);
  let receivedJSON: TriggerPipelineJSonPayload = request.body;
  console.info( '[{Ghallagher[/trigger-pipeline] Router}] - infered {TriggerPipelineJSonPayload} => ', receivedJSON);

  let git_repo = {
    name: `${receivedJSON.git_repo.name}`,
    branch: `${receivedJSON.git_repo.branch}`
  }
  /*let pipelineConfig = {
    parameters: {
     gio_action: `${receivedJSON.parameters.gio_action}`,
     dry_run: true,
     secrethub_org: process.env.SECRETHUB_ORG,
     secrethub_repo: process.env.SECRETHUB_REPO,
     maven_profile_id: process.env.MAVEN_PROFILE_ID
    },
    branch: `${receivedJSON.git_repo.branch}`
  } */
  let pipelineConfig = {
    parameters: receivedJSON.parameters,
    branch: `${receivedJSON.git_repo.branch}`
  }

  let triggerPipelineSubscription = CircleCI.circleCIClientService.triggerCciPipeline(receivedJSON.github_org, `${git_repo.name}`, `${git_repo.branch}`, pipelineConfig).subscribe({
  next: (emittedJSONwithCciResponse: any) : void => {
    console.info( '[{Ghallagher[/trigger-pipeline] Router}] - received Circle CI API Response [data] => ', emittedJSONwithCciResponse  /* emittedJSONwithCciResponse.data // when retryWhen is used*/ )
    let entry: any = {};
    entry.pipeline = {
      pipeline_exec_number: `${emittedJSONwithCciResponse.number}`,
      id : `${emittedJSONwithCciResponse.id}`,
      created_at: `${emittedJSONwithCciResponse.created_at}`,
      exec_state: `${emittedJSONwithCciResponse.state}`,
      project_slug: `${emittedJSONwithCciResponse.project_slug}`
    }
    let JSONdataForResponse = {
      message : "[{Ghallagher[/trigger-pipeline] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
      emittedJSONwithCciResponse: emittedJSONwithCciResponse
    }
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = emittedJSONwithCciResponse.cci_http_response_status.status_code;
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
