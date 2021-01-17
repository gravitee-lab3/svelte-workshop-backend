/*
Author (Copyright) 2020 <Jean-Baptiste-Lasselle>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

If your software can interact with users remotely through a computer
network, you should also make sure that it provides a way for users to
get its source.  For example, if your program is a web application, its
interface could display a "Source" link that leads users to an archive
of the code.  There are many ways you could offer source, and different
solutions will be better for different programs; see section 13 for the
specific requirements.

You should also get your employer (if you work as a programmer) or school,
if any, to sign a "copyright disclaimer" for the program, if necessary.
For more information on this, and how to apply and follow the GNU AGPL, see
<https://www.gnu.org/licenses/>.
*/
import * as rxjs from 'rxjs';
import { map, tap, retryWhen, delayWhen,delay,take } from 'rxjs/operators';
import axios from 'axios';
import { CircleCISecrets } from './CircleCISecrets'
import * as fs from 'fs';

/**
 * Will be used to paginate The Circle CI API
 * [GET /api/v2/pipeline/${PARENT_PIPELINE_GUID}/workflow] Endpoint
 * toget all workflows of a given Circle CI Pipeline Execution
 **/
export interface WfPaginationRef {
  next_page_token: string,
  pipeline_guid: string
}
/**
 * Will be used to paginate The Circle CI API
 * [GET /api/v2/workflow/${WF_GUID}/job] Endpoint
 * to get all Jobs Executions States of a given Circle CI Workflow Execution
 **/
export interface JobPaginationRef {
  next_page_token: string,
  workflow_guid: string
}
/**
 *
 * Mimics the official Circle CI cLient, only much simpler, and with [RxJS]
 * Circle CI API v2 based
 **/
export class CircleCIClient {
  private secrets!: CircleCISecrets;
  constructor() {
    this.loadCircleCISecrets();
  }
  loadCircleCISecrets () : void { ///     private secrets: CircleCISecrets;
    /// first load the secretfile

    let secretFileAsString: string = fs.readFileSync(`${process.env.SECRETS_FILE_PATH}`,'utf8');
    this.secrets = JSON.parse(secretFileAsString);
    console.debug('');
    console.debug("[{CircleCIClient}] - loaded secrets file content :");
    console.debug('');
    console.debug(this.secrets)
    console.debug('');

  }

    /**
     * Triggers a Circle CI Pipeline, for a repo on Github
     *
     * @argument org_name  {@type string} the github organization name if the git repo in on github.com
     * @argument repo_name {@type string} the Circle CI project name, matching the github repo name, e.g."circleci",
     * @argument branch {@type string} the git branch "master" on which to trigger the pipeline
     * @argument pipelineParameters {@type any} the Circle CI pipeline parameters. For Example, a  :
     *
     * -----
     * <pre>
     *      version: 2.1
     *      jobs:
     *        build:
     *          docker:
     *            - image: "circleci/node:<< pipeline.parameters.image-tag >>"
     *          environment:
     *            IMAGETAG: "<< pipeline.parameters.image-tag >>"
     *            GRAVITEEIO_VERSION: "<< pipeline.parameters.graviteeio-version >>"
     *            GRAVITEEIO_VERSION_MINOR: "<< pipeline.parameters.graviteeio-version-minor >>"
     *            GRAVITEEIO_VERSION_MAJOR: "<< pipeline.parameters.graviteeio-version-major >>"
     *          steps:
     *            - run: echo "Docker Image tag used was ${IMAGETAG}"
     *            - run: echo "GRAVITEEIO_VERSION used was ${GRAVITEEIO_VERSION}"
     *            - run: echo "GRAVITEEIO_VERSION_MINOR used was ${GRAVITEEIO_VERSION_MINOR}"
     *            - run: echo "GRAVITEEIO_VERSION_MAJOR used was ${GRAVITEEIO_VERSION_MAJOR}"
     *      parameters:
     *        image-tag:
     *          default: latest
     *          type: string
     *        graviteeio-version:
     *          default: 3.1.0
     *          type: string
     *        graviteeio-version-minor:
     *          default: 3.1
     *          type: string
     *        graviteeio-version-major:
     *          default: 3
     *          type: string
     *
     * </pre>
     * -----
     *
     *  then <pre>pipelineParameters</pre> should be (except the values) :
     *
     * -----
     * <pre>
     * {
     *    "parameters": {
     *      "image-tag": "3.1.14-full",
     *      "graviteeio-version": "3.1.14",
     *      "graviteeio-version-minor": "3.1",
     *      "graviteeio-version-major": "3"
     *    }
     *  }
     * </pre>
     * -----
     *
     *
     * @returns any But it actually is an Observable Stream of the HTTP response you can subscribe to.
     **/
    triggerCciPipeline(org_name: string, repo_name: string, branch: string, pipelineParameters: any): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {

      let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
          let config = {
            headers: {
              "Circle-Token": this.secrets.circleci.auth.token,
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          };
          // curl -X POST
          let jsonPayload: any = pipelineParameters;
          jsonPayload.branch = `${branch}`;

          console.info("curl -X POST -d " + `${JSON.stringify(jsonPayload)}` + " -H 'Content-Type: application/json'" + " -H 'Accept: application/json'" + " -H 'Circle-Token: " + `${this.secrets.circleci.auth.token}` + "' https://circleci.com/api/v2/project/gh/" + `${org_name}` + "/" + `${repo_name}` + "/pipeline");

          /// axios.post( 'https://circleci.com/api/v2/me', jsonPayloadExample, config ).then(....)
          axios.post( "https://circleci.com/api/v2/project/gh/" + `${org_name}` + "/" + `${repo_name}` + "/pipeline", jsonPayload, config )
          .then( ( response ) => {
              let emitted = response.data;
              emitted.project_slug = `gh/${org_name}/${repo_name}`; // won't hurt, will it ?
              emitted.cci_http_response_status = {
                status_code: response.status,
                status_text: response.statusText
              }; // won't hurt, will it ?
              observer.next( emitted );
              observer.complete();
          } )
          .catch( ( error ) => {
              console.log("Circle CI HTTP Error JSON Response is : ");
              /// console.log(JSON.stringify(error.response));
              console.log(error.response);
              let emittedError = {
                axios_error: error,
                cci_http_response_status : {
                  status_code: error.response.status,
                  status_text: error.response.statusText
                }
              }; // won't hurt, will it ?
              observer.error( emittedError );
          } );

      } );
      return observableRequest;

/*
      let requestConfig = {
        headers: {
          "Circle-Token": this.secrets.circleci.auth.token,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      };
      let jsonPayload: any = pipelineParameters;
      const cci_rest_endpoint = "https://circleci.com/api/v2/project/gh/";
      const source = rxjs.from(axios.post( "https://circleci.com/api/v2/project/gh/" + `${org_name}` + "/" + `${repo_name}` + "/pipeline", jsonPayload, requestConfig )).pipe(
      tap(val => console.log(`fetching ${cci_rest_endpoint} which you won't see `)),)
      const response$ = source.pipe(
        map(axiosResponse => {
          if (!(axiosResponse.status == 200 || axiosResponse.status == 201 || axiosResponse.status == 203)) {
            //error will be picked up by retryWhen
            throw axiosResponse;
          }
          return axiosResponse; /// return value  HTTP Response Code si 200
        }),
        retryWhen(errors =>
          errors.pipe(
            //log error message
            tap(axiosResponse => {
              console.log(`Error occured, trying to fetch [${cci_rest_endpoint}], HTTP Response is : `);
              console.log(`Error occured, trying to fetch [${JSON.stringify(axiosResponse.data)}], now retrying`);
              console.log(`Error occured, trying to fetch [${cci_rest_endpoint}], now retrying`);
            }),
            //restart in 5 seconds
            delay(3000), /// wait 3 seconds before retrying
            /// delayWhen(val => timer(val * 1000)),
            /// delayWhen(val => rxjs.timer(7 * 1000)), /// wait 7 seconds before retrying
            take(1) // we only need ONE successful HTTP call, to trigger a pipeline, and after that, if ever Circle CI API v2 gets buggy, we ignore it.
          )
        )
      );

      return response$;*/
    }
    /**
     *
     * This method inspects the execution status of a pipeline, by inspecting its workflows' status
     *
     * curl -X GET https://circleci.com/api/v2/pipeline/${PIPELINE_ID}/workflow -H 'Accept: application/json' -H "Circle-Token: ${CCI_API_KEY}"
     *
     * @parameters pipeline_guid The GUID of the Circle CI pipeline execution
     * @parameters next_page_token set <code>next_page_token</code> to null if no pagination desired
     * @returns any But it actually is an Observable Stream of the HTTP response you can subscribe to.
     *
     * Note that the HTTP JSON Response will be of the following form :
     *
     *      {
     *        "next_page_token": null,
     *        "items": [
     *          {
     *            "pipeline_id": "b4f4eabc-d572-4fdf-916a-d5f05d178221",
     *            "id": "75e83261-5b3c-4bc0-ad11-514bb01f634c",
     *            "name": "docker_build_and_push",
     *            "project_slug": "gh/gravitee-lab/GraviteeCiCdOrchestrator",
     *            "status": "failed",
     *            "started_by": "a159e94e-3763-474d-8c51-d1ea6ed602d4",
     *            "pipeline_number": 126,
     *            "created_at": "2020-09-12T17:47:21Z",
     *            "stopped_at": "2020-09-12T17:48:26Z"
     *          },
     *          {
     *            "pipeline_id": "b4f4eabc-d572-4fdf-916a-d5f05d178221",
     *            "id": "cd7b408f-48d4-4ba7-8a0a-644d82267434",
     *            "name": "yet_another_test_workflow",
     *            "project_slug": "gh/gravitee-lab/GraviteeCiCdOrchestrator",
     *            "status": "success",
     *            "started_by": "a159e94e-3763-474d-8c51-d1ea6ed602d4",
     *            "pipeline_number": 126,
     *            "created_at": "2020-09-12T17:47:21Z",
     *            "stopped_at": "2020-09-12T17:48:11Z"
     *          }
     *        ]
     *      }
     *
     *
     **/
   inspectPipelineWorkflowsExecState(parent_pipeline_guid: string, next_page_token: string): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {

     let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
         let config = {
           headers: {
             "Circle-Token": this.secrets.circleci.auth.token,
             "Accept": "application/json",
             "Content-Type": "application/json"
           }
         };
         //


         console.info("curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Circle-Token: <secret token value>' https://circleci.com/api/v2/pipeline/" + `${parent_pipeline_guid}` + "/workflow");

         /// axios.post( 'https://circleci.com/api/v2/me', jsonPayloadExample, config ).then(....)
         let httpRequest = null;
         if (next_page_token === null) {
           httpRequest = "https://circleci.com/api/v2/pipeline/" + `${parent_pipeline_guid}` + "/workflow";
         } else {
           httpRequest = "https://circleci.com/api/v2/pipeline/" + `${parent_pipeline_guid}` + `/workflow?next_page_token=${next_page_token}`;
         }

         axios.get(httpRequest, config )
         .then( ( response ) => {
             let emitted: WorkflowsData = {
               cci_json_response: response.data,
               parent_pipeline_guid: parent_pipeline_guid
             }
             observer.next( emitted );
             observer.complete();
         } )
         .catch( ( error ) => {
             console.log("[CircleCIClient] - {inspectPipelineWorkflowsExecState(pipeline_guid: string)} - Circle CI HTTP Error JSON Response is : ");
             /// console.log(JSON.stringify(error.response));
             console.log(error.response);
             observer.error(error );
         } );

     } );
     return observableRequest;

   }

   inspectPipelineExecState(project_slug: string, pipeline_number: number): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {

     let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
         let config = {
           headers: {
             "Circle-Token": this.secrets.circleci.auth.token,
             "Accept": "application/json",
             "Content-Type": "application/json"
           }
         };
                   /// curl -X GET https://circleci.com/api/v2/project/${project_slug}/pipeline/${pipeline_number}
         console.info("curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Circle-Token: <secret token value>' https://circleci.com/api/v2/project/" + `${project_slug}` + "/pipeline/" + `${pipeline_number}`);

         let httpRequest = "https://circleci.com/api/v2/project/" + `${project_slug}` + "/pipeline/" + `${pipeline_number}`;

         axios.get(httpRequest, config )
         .then(( response ) => {
             console.log("[CircleCIClient] - {inspectPipelineExecState(project_slug: string, pipeline_number: number)} - Circle CI HTTP JSON Response is : ");
             console.log(response.data);
             observer.next(response.data);
             observer.complete();
         })
         .catch( ( error ) => {
             console.log("[CircleCIClient] - {inspectPipelineExecState(project_slug: string, pipeline_number: number)} - Circle CI HTTP Error JSON Response is : ");
             /// console.log(JSON.stringify(error.response));
             console.log(error.response);
             observer.error(error );
         } );

     } );
     return observableRequest;

   }




  ///

  /**
   *
   * This method inspects the execution status of all Jobs in a given Workflow
   *
   *
   * @parameters workflow_guid The GUID of the Circle CI workflow execution
   * @parameters next_page_token set <code>next_page_token</code> to null if no pagination desired
   * @returns any But it actually is an Observable Stream of the HTTP response you can subscribe to.
   *
   * curl -X GET https://circleci.com/api/v2/workflow/${WF_GUID}/job -H 'Accept: application/json' -H "Circle-Token: ${CCI_API_KEY}"
   *
   * Note that the HTTP JSON Response will be of the following form :
   *
   * {
   *  "next_page_token": null,
   *  "items": [
   *    {
   *      "dependencies": [],
   *      "job_number": 127,
   *      "id": "fc2332c9-ce54-405b-8b4f-d5af38210627",
   *      "started_at": "2020-09-12T17:47:25Z",
   *      "name": "build",
   *      "project_slug": "gh/gravitee-lab/GraviteeCiCdOrchestrator",
   *      "status": "failed",
   *      "type": "build",
   *      "stopped_at": "2020-09-12T17:48:26Z"
   *    }
   *  ]
   * }
   *
   *
   **/
   inspectWorkflowJobsExecState(parent_workflow_guid: string, next_page_token: string): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {

     let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
         let config = {
           headers: {
             "Circle-Token": this.secrets.circleci.auth.token,
             "Accept": "application/json",
             "Content-Type": "application/json"
           }
         };
         //


         console.info("curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Circle-Token: <secret token value>' https://circleci.com/api/v2/workflow/" + `${parent_workflow_guid}` + "/job");

         /// axios.post( 'https://circleci.com/api/v2/me', jsonPayloadExample, config ).then(....)
         let httpRequest = null;
         if (next_page_token === null) {
           httpRequest = "https://circleci.com/api/v2/workflow/" + `${parent_workflow_guid}` + "/job";
         } else {
           httpRequest = "https://circleci.com/api/v2/workflow/" + `${parent_workflow_guid}` + `/job?next_page_token=${next_page_token}`;
         }

         axios.get(httpRequest, config )
         .then( ( response ) => {
             let emitted: WorkflowJobsData = {
               cci_json_response: response.data,
               parent_workflow_guid : parent_workflow_guid
             }
             observer.next( emitted );
             observer.complete();
         } )
         .catch( ( error ) => {
             console.log("[CircleCIClient] - {inspectWorkflowJobsExecState(workflow_guid: string, next_page_token: string)} - Circle CI HTTP Error JSON Response is : ");
             /// console.log(JSON.stringify(error.response));
             console.log(error.response);
             observer.error(error );
         } );

     } );
     return observableRequest;

   }


   /**
    * Asynchronous method to retrieve a Pipeline project name (github repo) :
    *
    * This method returns the "Project Slug" as defined by The Cirlce CI API
    * For example : "project_slug": "gh/gravitee-lab/graviteek-cicd-test-maven-project-g1",
    **/
    async getGithubRepoNameFrom(pipeline_guid: string) {

      let projectSlug: string = "";
      //const githubApiAccessToken = jsonifiedSession.passport.user.github_access_token;
      let config = {
        headers: {
          "Circle-Token": this.secrets.circleci.auth.token,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      };
      const axiosService = axios.create({
        baseURL: 'https://circleci.com/api/v2/',
        timeout: 5000,
        headers: config.headers
      });

      ///
      try {
        const [circleciApiRespone] = await axios.all([
          axiosService.get(`/pipeline/${pipeline_guid}`)
        ]);
        console.log(`---------------------------------------`)
        console.log(` >>>>>>>>>>>>>>> Circle CI API RESPONSE (FOR PIPELINE OF GUID ${pipeline_guid} ) PROJECT SLUG IS : [${circleciApiRespone.data.project_slug}] `)
        console.log(`---------------------------------------`)
        console.log(` >>>>>>>>>>>>>>> Circle CI API RESPONSE (FOR PIPELINE OF GUID ${pipeline_guid} ) IS : `)
        console.log(circleciApiRespone.data);
        projectSlug = circleciApiRespone.data.project_slug
        /** example response:
            {
              "id": "628d5730-e084-4122-a0c8-b6720fbf3716",
              "errors": [],
              "project_slug": "gh/gravitee-lab/graviteek-cicd-test-maven-project-g1",
              "updated_at": "2020-12-30T04:53:42.687Z",
              "number": 2,
              "state": "created",
              "created_at": "2020-12-30T04:53:42.687Z",
              "trigger": {
                "received_at": "2020-12-30T04:53:42.230Z",
                "type": "api",
                "actor": {
                  "login": "Jean-Baptiste-Lasselle",
                  "avatar_url": "https://avatars2.githubusercontent.com/u/35227860?v=4"
                }
              },
              "vcs": {
                "origin_repository_url": "https://github.com/gravitee-lab/graviteek-cicd-test-maven-project-g1",
                "target_repository_url": "https://github.com/gravitee-lab/graviteek-cicd-test-maven-project-g1",
                "revision": "57571e24ca6d2f75d7dbeb87ae50efd5d41bf87c",
                "provider_name": "GitHub",
                "branch": "4.1.x"
              }
            }
         **/
        console.log(`---------------------------------------`)
      } catch (error) {
        console.log(`---------------------------------------`)
        console.log(` >>>>>>>>>>>>>>> GITHUB API ERROR (FOR AUTHENTICATED USER) IS : `)
        console.log(error);
        console.log(`---------------------------------------`)
        throw error;
      }
      return projectSlug;
    }

    /**
     * Hits the Circle CI API and return an {@see ObservableStream<any>} emitting the Circle CI JSON answer for the https://circleci.com/api/v2/me Endpoint
     **/
    whoami(): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {
        let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
            let config = {
              headers: {
                "Circle-Token": this.secrets.circleci.auth.token,
                "Accept": "application/json",
                "Content-Type": "application/json"
              }
            };

            console.info("curl -X GET -H 'Content-Type: application/json'" + " -H 'Accept: application/json'" + " -H 'Circle-Token: " + `${this.secrets.circleci.auth.token}` + "' https://circleci.com/api/v2/me");

            axios.get( "https://circleci.com/api/v2/me", config )
            .then( ( response ) => {
                let emitted = response.data;
                emitted.cci_http_response_status = {
                  status_code: response.status,
                  status_text: response.statusText
                };

                observer.next( emitted );
                observer.complete();
            } )
            .catch( ( error ) => {
                /// console.log("Circle CI HTTP Error JSON Response is : ");
                /// console.log(error.response);
                let emittedError: any = {
                  axios_error: error,
                  cci_http_response_status : {
                    status_code: error.response.status,
                    status_text: error.response.statusText
                  }
                }; // won't hurt, will it ?
                console.log(" GHALLAGHER emittedError is : ");
                console.log(emittedError);
                observer.error( emittedError );
            } );

        } );
        return observableRequest;
      }
}

/**
 *
 **/



/**
 * We need this type, because the CircleCI API JSON Response about Jobs Execution State does
 * not include enough information to retrieve the workflow execution,toxhich a JobExecution belongs to.
 * Now the Observable Stream emiting CircleCI API JSON Response about Jobs Execution, will also mention workflow_guid
 **/
export interface WorkflowJobsData {
  cci_json_response: any,
  parent_workflow_guid: string
}

/**
 * we need this type, because we don't want to be doomed to inspect the CircleCI API JSON Response  about Workflows Execution State
 * to retrieve the inspected Workflows parent pipeline GUID
 * not include enough information to retrieve the workflow execution,toxhich a JobExecution belongs to.
 * Now the Observable Stream emiting CircleCI API JSON Response about Jobs Execution, will also mention workflow_guid
 **/
export interface WorkflowsData {
  cci_json_response: any,
  parent_pipeline_guid: string
}
