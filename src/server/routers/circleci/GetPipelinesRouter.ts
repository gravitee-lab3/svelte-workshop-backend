import { Router } from 'express';
import * as CircleCI from '../../lib/circleci/';
import { GetPipelinesJSonPayload } from './GetPipelinesJSonPayload';

// This router allowstolist all pipeline executions, for a given github repo, in a given github org, with pagination
const getPipelinesRouter = Router();
const path = '/get-pipelines';

getPipelinesRouter.get(`${path}`, (request, response) => {
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
  console.info( '[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response [data] => ', request.body);
  let receivedJSON: GetPipelinesJSonPayload = request.body;
  console.info( '[{Ghallagher[/get-pipelines] Router}] - infered {GetPipelinesJSonPayload} => ', receivedJSON);


  let getPipelineSubscription = null;

  if (receivedJSON.hasOwnProperty('page_token') && receivedJSON.hasOwnProperty('mine')) {
    getPipelineSubscription = CircleCI.circleCIClientService.getPipelines(receivedJSON.github_org, receivedJSON.mine, receivedJSON.page_token).subscribe({
        next: (emittedJSONwithCciResponse: any) : void => {
          console.info( '[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response [data] => ', emittedJSONwithCciResponse  /* emittedJSONwithCciResponse.data // when retryWhen is used*/ )
          let entry: any = {};
          entry.pipeline = {
            pipeline_exec_number: `${emittedJSONwithCciResponse.number}`,
            id : `${emittedJSONwithCciResponse.id}`,
            created_at: `${emittedJSONwithCciResponse.created_at}`,
            exec_state: `${emittedJSONwithCciResponse.state}`,
            project_slug: `${emittedJSONwithCciResponse.project_slug}`
          }
          let JSONdataForResponse = {
            message : "[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
            emittedJSONwithCciResponse: emittedJSONwithCciResponse
          }
          response.setHeader('Content-Type', 'application/json');
          response.statusCode = emittedJSONwithCciResponse.cci_http_response_status.status_code;
          response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        },
        complete: (data: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines successfully completed :)]');
        },
        error: (catched_error: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]')
           let JSONErrorDataForResponse: any = {
             message: '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]',
             error: {
               http_response: catched_error.axios_error.response,
               status_code: catched_error.cci_http_response_status.status_code,
               status_text: catched_error.cci_http_response_status.status_text
             }
           };
           JSONErrorDataForResponse = {
             message: `[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]`,
             cci_message: catched_error.axios_error.response.data.message,
             cci_status_code: catched_error.cci_http_response_status.status_code,
             cci_status_text: catched_error.cci_http_response_status.status_text
           };
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - JSONErrorDataForResponse is : ]');
           console.log(JSONErrorDataForResponse);
           response.setHeader('Content-Type', 'application/json');
           response.statusCode = catched_error.cci_http_response_status.status_code;
           response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        }
      });
  } else if (receivedJSON.hasOwnProperty('mine')) {
    getPipelineSubscription = CircleCI.circleCIClientService.getPipelines(receivedJSON.github_org, receivedJSON.mine).subscribe({
        next: (emittedJSONwithCciResponse: any) : void => {
          console.info( '[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response [data] => ', emittedJSONwithCciResponse  /* emittedJSONwithCciResponse.data // when retryWhen is used*/ )
          let entry: any = {};
          entry.pipeline = {
            pipeline_exec_number: `${emittedJSONwithCciResponse.number}`,
            id : `${emittedJSONwithCciResponse.id}`,
            created_at: `${emittedJSONwithCciResponse.created_at}`,
            exec_state: `${emittedJSONwithCciResponse.state}`,
            project_slug: `${emittedJSONwithCciResponse.project_slug}`
          }
          let JSONdataForResponse = {
            message : "[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
            emittedJSONwithCciResponse: emittedJSONwithCciResponse
          }
          response.setHeader('Content-Type', 'application/json');
          response.statusCode = emittedJSONwithCciResponse.cci_http_response_status.status_code;
          response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        },
        complete: (data: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines successfully completed :)]');
        },
        error: (catched_error: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]')
           let JSONErrorDataForResponse: any = {
             message: '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]',
             error: {
               http_response: catched_error.axios_error.response,
               status_code: catched_error.cci_http_response_status.status_code,
               status_text: catched_error.cci_http_response_status.status_text
             }
           };
           JSONErrorDataForResponse = {
             message: `[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]`,
             cci_message: catched_error.axios_error.response.data.message,
             cci_status_code: catched_error.cci_http_response_status.status_code,
             cci_status_text: catched_error.cci_http_response_status.status_text
           };
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - JSONErrorDataForResponse is : ]');
           console.log(JSONErrorDataForResponse);
           response.setHeader('Content-Type', 'application/json');
           response.statusCode = catched_error.cci_http_response_status.status_code;
           response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        }
      });
  } else if (receivedJSON.hasOwnProperty('page_token')) {
    getPipelineSubscription = CircleCI.circleCIClientService.getPipelines(receivedJSON.github_org, false, receivedJSON.page_token).subscribe({
        next: (emittedJSONwithCciResponse: any) : void => {
          console.info( '[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response [data] => ', emittedJSONwithCciResponse  /* emittedJSONwithCciResponse.data // when retryWhen is used*/ )
          let entry: any = {};
          entry.pipeline = {
            pipeline_exec_number: `${emittedJSONwithCciResponse.number}`,
            id : `${emittedJSONwithCciResponse.id}`,
            created_at: `${emittedJSONwithCciResponse.created_at}`,
            exec_state: `${emittedJSONwithCciResponse.state}`,
            project_slug: `${emittedJSONwithCciResponse.project_slug}`
          }
          let JSONdataForResponse = {
            message : "[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
            emittedJSONwithCciResponse: emittedJSONwithCciResponse
          }
          response.setHeader('Content-Type', 'application/json');
          response.statusCode = emittedJSONwithCciResponse.cci_http_response_status.status_code;
          response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        },
        complete: (data: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines successfully completed :)]');
        },
        error: (catched_error: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]')
           let JSONErrorDataForResponse: any = {
             message: '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]',
             error: {
               http_response: catched_error.axios_error.response,
               status_code: catched_error.cci_http_response_status.status_code,
               status_text: catched_error.cci_http_response_status.status_text
             }
           };
           JSONErrorDataForResponse = {
             message: `[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]`,
             cci_message: catched_error.axios_error.response.data.message,
             cci_status_code: catched_error.cci_http_response_status.status_code,
             cci_status_text: catched_error.cci_http_response_status.status_text
           };
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - JSONErrorDataForResponse is : ]');
           console.log(JSONErrorDataForResponse);
           response.setHeader('Content-Type', 'application/json');
           response.statusCode = catched_error.cci_http_response_status.status_code;
           response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        }
      });
  } else {
    getPipelineSubscription = CircleCI.circleCIClientService.getPipelines(receivedJSON.github_org).subscribe({
        next: (emittedJSONwithCciResponse: any) : void => {
          console.info( '[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response [data] => ', emittedJSONwithCciResponse  /* emittedJSONwithCciResponse.data // when retryWhen is used*/ )
          let entry: any = {};
          entry.pipeline = {
            pipeline_exec_number: `${emittedJSONwithCciResponse.number}`,
            id : `${emittedJSONwithCciResponse.id}`,
            created_at: `${emittedJSONwithCciResponse.created_at}`,
            exec_state: `${emittedJSONwithCciResponse.state}`,
            project_slug: `${emittedJSONwithCciResponse.project_slug}`
          }
          let JSONdataForResponse = {
            message : "[{Ghallagher[/get-pipelines] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
            emittedJSONwithCciResponse: emittedJSONwithCciResponse
          }
          response.setHeader('Content-Type', 'application/json');
          response.statusCode = emittedJSONwithCciResponse.cci_http_response_status.status_code;
          response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        },
        complete: (data: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines successfully completed :)]');
        },
        error: (catched_error: any) => {
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]')
           let JSONErrorDataForResponse: any = {
             message: '[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]',
             error: {
               http_response: catched_error.axios_error.response,
               status_code: catched_error.cci_http_response_status.status_code,
               status_text: catched_error.cci_http_response_status.status_text
             }
           };
           JSONErrorDataForResponse = {
             message: `[{[Ghallagher[/get-pipelines] Router]} - browsing Circle CI Pipelines failed!!!]`,
             cci_message: catched_error.axios_error.response.data.message,
             cci_status_code: catched_error.cci_http_response_status.status_code,
             cci_status_text: catched_error.cci_http_response_status.status_text
           };
           console.log( '[{[Ghallagher[/get-pipelines] Router]} - JSONErrorDataForResponse is : ]');
           console.log(JSONErrorDataForResponse);
           response.setHeader('Content-Type', 'application/json');
           response.statusCode = catched_error.cci_http_response_status.status_code;
           response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
        }
      });
  }


});

export default getPipelinesRouter;
