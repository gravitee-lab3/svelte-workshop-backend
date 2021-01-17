/// import * as passport from 'passport';
import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2'
/// import * as passport_oauth2 from 'passport-oauth2' // passport_oauth2.OAuth2Strategy
import * as passport_github2 from 'passport-github2';
import { GithubApiClient } from './api'


class AuthenticatedUserHandler {

  private jsonresponse: any;
  private ready: boolean;
  private static gh_api_client: GithubApiClient;

  constructor() {
    this.ready = false;
    this.jsonresponse = {
      sorry: 'I did not get the returned JSON from GithubAPI '
    }

  }

  public hasReceivedResponse(): boolean {
    return this.ready;
  }
  public getReceivedResponse(): any {
    return this.jsonresponse;
  }
  public errorHandlerGetAuhtenticatedUserResponseData = (error: any) : void => {
    console.info( '[{server/auth/github}] - [errorHandlerGetAuhtenticatedUserResponseData] - Error trying to Get Authenticated User from Github API Response [data] => ', error )
    let entry: any = {};
    entry.pipeline = {
      execution_index: null,
      id : null,
      created_at: null,
      exec_state: null,
      error : {message: "[{server/auth/github}] - [errorHandlerGetAuhtenticatedUserResponseData] - trying to Get Authenticated User from Github API failed ", cause: error}
    }


    console.info('')
    console.info( '[{server/auth/github}] - [errorHandlerGetAuhtenticatedUserResponseData] [this.progressMatrix] is now :  ');
    console.info('')
    throw new Error('[{server/auth/github}] - [errorHandlerGetAuhtenticatedUserResponseData] trying to Get Authenticated User from Github API failed with error : [' + error + '] ')
  }

  public handleGetAuhtenticatedUserResponseData = (githubApiJsonResponse: any) : void => {
    console.info( '[{server/auth/github}] - [handleGetAuhtenticatedUserResponseData] Processing Github API Response [data] => ', githubApiJsonResponse  /* circleCiJsonResponse.data // when retryWhen is used*/ )
    let receivedResponse: any = {};
    receivedResponse = {
      /*
      // when retryWhen is used
      pipeline_exec_number: `${circleCiJsonResponse.data.number}`,
      id : `${circleCiJsonResponse.data.id}`,
      created_at: `${circleCiJsonResponse.data.created_at}`,
      exec_state: `${circleCiJsonResponse.data.state}`
      */
      login: `${githubApiJsonResponse.login}`,
      avatar_url : `${githubApiJsonResponse.avatar_url}`,
      organizations_url: `${githubApiJsonResponse.organizations_url}`,
      profile_api_url: `${githubApiJsonResponse.url}`,
      profile_html_url: `${githubApiJsonResponse.html_url}`,
      bio: `${githubApiJsonResponse.bio}`,
      repos_url: `${githubApiJsonResponse.repos_url}`,
      pokus_additional_info_returned: `${githubApiJsonResponse.pokus_additional_info_returned}`
    }
    console.log('Here is the [receivedResponse] from Github API :')
    console.log(receivedResponse)
    this.jsonresponse = receivedResponse;
    this.ready = true;
  }

  private isAuthenticatedUserInGithubOrg = (accessToken: string) => {
    let answer: boolean = false;

    // I send the HTTP Request to Github API to check if the user is a member of
    /// the configured Github Organization with process.env.AUTHORIZED_GITHUB_ORG
    const gh_api_client = new GithubApiClient(accessToken);
    let githubApiSubscription = gh_api_client.getAuthenticatedUser().subscribe({
      next: this.handleGetAuhtenticatedUserResponseData.bind(this),
      complete: (data: any): void => {
         console.log( '[{[isAuthenticatedUserInGithubOrg]} - Reactively getting authenticated user from Github API completed! :)]')
      },
      error: this.errorHandlerGetAuhtenticatedUserResponseData.bind(this)
    });

    while (!this.hasReceivedResponse()) {
      /// best thing is to use logs in expressjs (log to a file)
       console.log('waiting for response from Github API ...');
       process.stdout.clearLine(0);
    }
    answer = this.getReceivedResponse();
    /// authenticatedUserHandler.getGithubApiAnswer();
    answer = true;
    return answer;
  }

  public verify = (
    accessToken: string,
    refreshToken: string,
    profile: passport_github2.Profile, // type was Profile, but well, I don't have a Profile interface or class
    done: OAuth2Strategy.VerifyCallback
  ): void => {
    console.log('hugo-express accessToken : ', accessToken)
    console.log('hugo-express refreshToken : ', refreshToken)
    console.log('hugo-express profile : ', profile)

    let authenticationRejector = null;
     /// is false when the authenticated user is not inthe desired Github Organisation
    /* Impossible to make an synchronous HTTP Call to github API forthe verify
    if (this.isAuthenticatedUserInGithubOrg(accessToken)) {
      authenticationRejector = done(null, {github_profile: profile});
    } else {
      let errMsg =  `The [${profile.username}] Github User is not authorized to access webite : he is not a member of the [${process.env.AUTHORIZED_GITHUB_ORG}] Github organization`;
      console.log(errMsg)
      authenticationRejector = done(null, null!, {message: errMsg});
      /// authenticationRejector = done(new Error(errMsg), {github_profile: profile});

    }
    */
    // authenticationRejector = done(null, {github_profile: profile, access_token: accessToken});
    // return done(null, {profile: profile, accessToken: accessToken})
    // return authenticationRejector;
    // return done(null, null!)
    return done(null, {github_profile: profile, github_access_token: accessToken});;

  };
}

const authenticatedUserHandler = new AuthenticatedUserHandler();

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
const passport_github2_option: passport_github2.StrategyOptions = {
  clientID: `${process.env.GITHUB_CLIENT_ID}`,
  clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  callbackURL: `${process.env.GITHUB_AUTH_CALLBACK_URL}` /// "http://localhost:5000/auth/gh/verte/callback"
};




/*
const verify = (
  accessToken: string,
  refreshToken: string,
  profile: passport_github2.Profile, // type was Profile, but well, I don't have a Profile interface or class
  done: OAuth2Strategy.VerifyCallback
): void => {
  console.log('hugo-express accessToken : ', accessToken)
  console.log('hugo-express refreshToken : ', refreshToken)
  console.log('hugo-express profile : ', profile)

  let authenticationRejector = null;
   /// is false when the authenticated user is not inthe desired Github Organisation
  if (isAuthenticatedUserInGithubOrg(accessToken)) {
    authenticationRejector = done(null, {github_profile: profile});
  } else {
    let errMsg =  `The [${profile.username}] Github User is not authorized to access webite : he is not a member of the [${process.env.AUTHORIZED_GITHUB_ORG}] Github organization`;
    console.log(errMsg)
    authenticationRejector = done(null, null!, {message: errMsg});
    /// authenticationRejector = done(new Error(errMsg), {github_profile: profile});

  }
  // return done(null, {profile: profile, accessToken: accessToken})
  // return done(null, null!)
  return authenticationRejector;

};*/
// this.passportService
// passport.PassportStatic
// Passport session setup.

passport.serializeUser((user, done) => {
  done(null, user)
});

passport.deserializeUser((user: any, done) => {
  done(null, user)
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new passport_github2.Strategy(passport_github2_option, authenticatedUserHandler.verify));

export default passport
