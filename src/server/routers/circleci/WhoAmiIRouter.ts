import { Router } from 'express';
import * as CircleCI from '../../lib/circleci/';
// import { circleCIClientService } from '../../lib/circleci/';
// import circleCIClientService  from '../../lib/circleci/CircleCIClient';
const whoamIRouter = Router();
const path = '/whoami';

whoamIRouter.get(`${path}`, (request, response) => {
  /* let JSONdataForResponse = {
    message : "OK", // user property is there just because it is required by the [views/layout.ejs] template
    circleCiJsonResponse: {}
  }

  response.json(JSONdataForResponse);*/

  let whoamiSubscription = CircleCI.circleCIClientService.whoami().subscribe({
  next: (circleCiJsonResponse: any) : void => {
    console.info( '[{Ghallagher[/whoami] Router}] - received Circle CI API Response [data] => ', circleCiJsonResponse  /* circleCiJsonResponse.data // when retryWhen is used*/ )
    let receivedJSONResponse: any = {
      pipeline_exec_number: `${circleCiJsonResponse.number}`,
      id : `${circleCiJsonResponse.id}`,
      created_at: `${circleCiJsonResponse.created_at}`,
      exec_state: `${circleCiJsonResponse.state}`,
      project_slug: `${circleCiJsonResponse.project_slug}`
    };

    let JSONdataForResponse = {
      message : "[{Ghallagher[/whoami] Router}] - received Circle CI API Response", // user property is there just because it is required by the [views/layout.ejs] template
      circleCiJsonResponse: circleCiJsonResponse
    }
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = 200;
    response.json(JSONdataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
  },
  complete: (data: any) => {
     console.log( '[{[Ghallagher[/me] Router]} - Circle CI API Call successfully completed :)]');
  },
  error: (catched_error: any) => {
     console.log( '[{[Ghallagher[/me] Router]} - Circle CI API Call failed!!!]')
     let JSONErrorDataForResponse: any = {
       message: '[{[Ghallagher[/me] Router]} - Circle CI API Call failed!!!]',
       error: {
         http_response: catched_error.axios_error.response,
         status_code: catched_error.cci_http_response_status.status_code,
         status_text: catched_error.cci_http_response_status.status_text
       }
     };
     JSONErrorDataForResponse = {
       message: `[{[Ghallagher[/me] Router]} - Circle CI API Call failed!!!]`,
       cci_message: catched_error.axios_error.response.data.message,
       cci_status_code: catched_error.cci_http_response_status.status_code,
       cci_status_text: catched_error.cci_http_response_status.status_text
     };
     console.log( '[{[Ghallagher[/me] Router]} - JSONErrorDataForResponse is : ]');
     console.log(JSONErrorDataForResponse);
     response.setHeader('Content-Type', 'application/json');
     response.statusCode = catched_error.cci_http_response_status.status_code;
     response.json(JSONErrorDataForResponse); // here the response is sent back from Express [whoamIRouter] to browser client app
  }
});
});

export default whoamIRouter;
