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
import { map, tap, retryWhen, delayWhen, delay, take } from 'rxjs/operators';
import * as axios from 'axios';

/**
 * 
 **/
export class GithubApiClient {
  private axiosService: axios.AxiosInstance;
  private githubApiAccessToken: string = '';
  constructor(accessToken: string) {
    this.githubApiAccessToken = accessToken;
    this.axiosService = axios.default.create({
      baseURL: 'https://api.github.com/',
      timeout: 5000,
      headers: {
        'Authorization': 'token '+ accessToken,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
  }


    /**
     *
     * Gets the Gihub authenticated User
     *
     * --- CURL :
     *  curl -H "Authorization: token ${GH_API_TOKEN}" https://api.github.com/user
     * ---
     * @argument accessToken  {@type string} the github API accesstoekn to use to hit the Github API
     * -----
     *
     * @returns any But it actually is an Observable Stream of the HTTP response you can subscribe to.
     *
     *
     *
     **/
    getAuthenticatedUser(): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {
      let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
          let config = {

          };
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{GithubApiClient}] - [{getAuthenticatedUser}] - APPEL CURL EQUIVALENT :`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.info("curl -X GET -H 'Content-Type: application/json'" + " -H 'Accept: application/json'" + " -H 'Authorization: token " + `${this.githubApiAccessToken}` + "' https://api.github.com/user");
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)
          console.log(`[{-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+-x+}]`)

          /// axios.post( 'https://circleci.com/api/v2/me', jsonPayloadExample, config ).then(....)
          //axios.post( "https://api.github.com/user", null, config )
          // this.axiosService.get("/user", config)
          this.axiosService.get("/user")
          .then( ( response ) => {
              let emitted = response.data;
              emitted.pokus_additional_info_returned = `whateveriwannasend`; // won't hurt, will it ?
              observer.next( emitted );
              observer.complete();
          } )
          .catch( ( error ) => {
              console.log("Github API HTTP Error JSON Response is : ");
              /// console.log(JSON.stringify(error.response));
              console.log(error.response);
              observer.error( error );
          } );

      } );
      return observableRequest;


    }
    examplePostWithJsonPayloadToGithubApi(): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {
      let observableRequest: any = rxjs.Observable.create( ( observer: any ) => {
          let config = {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          };
          // curl -X POST
          let jsonPayload: any = {
            something: "itsvalue",
            somthgelse: 45
          };
          jsonPayload.lastthinng = `somevalue`;

          console.info("curl -X POST -d " + `${JSON.stringify(jsonPayload)}` + " -H 'Content-Type: application/json'" + " -H 'Accept: application/json'" + " -H 'Circle-Token: " + `${this.githubApiAccessToken}` + "' https://api.github.com/user");

          /// axios.post( 'https://circleci.com/api/v2/me', jsonPayloadExample, config ).then(....)
          this.axiosService.post( "https://api.github.com/user", jsonPayload, config )
          .then( ( response ) => {
              let emitted = response.data;
              emitted.project_slug = `whateveriwannasend`; // won't hurt, will it ?
              observer.next( emitted );
              observer.complete();
          } )
          .catch( ( error ) => {
              console.log("Circle CI HTTP Error JSON Response is : ");
              /// console.log(JSON.stringify(error.response));
              console.log(error.response);
              observer.error( error );
          } );

      } );
      return observableRequest;


    }



  ///

  /**
   *
   * This method shows an example RXJS retryWhen
   *
   **/
   exampleRetryWhen(): any/*Observable<any> or Observable<AxiosResponse<any>>*/ {
     let requestConfig = {
       headers: {
         "Accept": "application/json",
         "Content-Type": "application/json"
       }
     };
     let jsonPayload: any = {};
     const github_rest_endpoint = "https://circleci.com/api/v2/project/gh/";
     const source = rxjs.from(this.axiosService.post( "https://circleci.com/api/v2/project/gh/user", jsonPayload, requestConfig )).pipe(
     tap(val => console.log(`fetching ${github_rest_endpoint} which you won't see `)),)
     const response$ = source.pipe(
       map(axiosResponse => {
         if (!(axiosResponse.status == 200 || axiosResponse.status == 201 || axiosResponse.status == 203)) {
           // error will be picked up by retryWhen
           throw axiosResponse;
         }
         return axiosResponse; /// return value  HTTP Response Code if 200
       }),
       retryWhen(errors =>
         errors.pipe(
           //log error message
           tap(axiosResponse => {
             console.log(`Error occured, trying to fetch [${github_rest_endpoint}], HTTP Response is : `);
             console.log(`Error occured, trying to fetch [${JSON.stringify(axiosResponse.data)}], now retrying`);
             console.log(`Error occured, trying to fetch [${github_rest_endpoint}], now retrying`);
           }),
           //restart in 5 seconds
           delay(3000), /// wait 3 seconds before retrying
           /// delayWhen(val => timer(val * 1000)),
           /// delayWhen(val => rxjs.timer(7 * 1000)), /// wait 7 seconds before retrying
           take(1) // we only need ONE successful HTTP call, to trigger a pipeline, and after that, if ever Circle CI API v2 gets buggy, we ignore it.
         )
       )
     );


     return response$;

   }




    /**
     * Hits the Circle CI API and return an {@see ObservableStream<any>} emitting the Circle CI JSON answer for the https://circleci.com/api/v2/me Endpoint
     **/
    whoami(): any {
      let observableRequest = rxjs.Observable.create( ( observer: any ) => {
          let config = {
            headers: {
              "Accept": "application/json"
            }
          };
          this.axiosService.get( 'https://circleci.com/api/v2/me', config )
          .then( ( response ) => {

              observer.next( response.data );
              observer.complete();
          })
          .catch( ( error ) => {
              observer.error( error );
          });
      } );
      return observableRequest;
    }
}
