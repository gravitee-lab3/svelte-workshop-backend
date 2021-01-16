// import * as express from 'express'
import express, { Request, Response } from 'express';
import { Application } from 'express';
import githubAuth from '../../../auth/github/';
import Session from 'express-session';
import * as body_parser from 'body-parser';
import * as method_override from 'method-override';
import partials from 'express-partials';
import asyncHandler = require("express-async-handler");
// import * as asyncHandler from "express-async-handler";
/// import * as axios from 'axios';
import axios from 'axios';

interface PokusSession {
  passport: {
    user: {
      github_access_token: string
    }
  }
}
class PokusMiddleware {

    /// public fqdn: string

    authorize (req:Request, res: Response, next: express.NextFunction) {
      console.log(`Est authentifié ? req.isAuthenticated()= ${req.isAuthenticated()}`)
      console.log(`---------------------------------------`)
      console.log(`---------------------------------------`)
      console.log(`---------------------------------------`)
      // const currentSession:CustomSession = req.session;
      console.log(`Github User is : ${req.user}`)
      console.log(req.user);
      console.log(`---------------------------------------`)
      console.log(` Express Session is : `)
      console.log(req.session)
      console.log(`---------------------------------------`)

      // console.log(` Gtihub access Token is : `)
      /// let session: Session.Session = req.session;
      let chaine = JSON.stringify(req.session);
      console.log(` JSON.stringify(req.session)  is : `)
      console.log(chaine)
      console.log(`---------------------------------------`)
      let jsonifiedSession: PokusSession = JSON.parse(chaine);
      if (jsonifiedSession.passport) {
        console.log(` Github Access Token : [${jsonifiedSession.passport.user.github_access_token}] `)
      }
      //console.log(jsonifiedSession.passport.github_access_token)
      console.log(`---------------------------------------`)
      // console.log(session.passport)
      // console.log(`---------------------------------------`)

      if (req.isAuthenticated()) { return next(); }; // isAuthenticated() comes from Passport
      //res.json({ error: `You are not a member of the [${process.env.AUTHORIZED_GITHUB_ORG}] Github organization` })
      //res.status(403);
      res.redirect('/login')
    }

    /**
     * The Async Middleware used to check if authenticated Github User is in the [process.env.AUTHORIZED_GITHUB_ORG] Github Org
     **/
    public checkUserIsInGithubOrg = asyncHandler(async (req:Request, res: Response, next: express.NextFunction) => {

      console.log(`---------------------------------------`)

      // console.log(` Gtihub access Token is : `)
      /// let session: Session.Session = req.session;
      let chaine = JSON.stringify(req.session);
      console.log(` JSON.stringify(req.session)  is : `)
      console.log(chaine)
      console.log(`---------------------------------------`)
      let jsonifiedSession: PokusSession = JSON.parse(chaine);
      if (jsonifiedSession.passport) {
        console.log(` Github Access Token : [${jsonifiedSession.passport.user.github_access_token}] `)
      }
      //console.log(jsonifiedSession.passport.github_access_token)
      console.log(`---------------------------------------`)

      let isUserInGithubOrg: boolean = false;

      if (req.isAuthenticated()) {
        const githubApiAccessToken = jsonifiedSession.passport.user.github_access_token;
        const axiosService = axios.create({
          baseURL: 'https://api.github.com/',
          timeout: 5000,
          headers: {
            'Authorization': 'token '+ githubApiAccessToken,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        });


        ///
        try {
          const [githubApiUserResponse] = await axios.all([
            axiosService.get('/user')
          ]);
          console.log(`---------------------------------------`)
          console.log(` >>>>>>>>>>>>>>> GITHUB API RESPONSE (FOR AUTHENTICATED USER) IS : `)
          console.log(githubApiUserResponse.data);
          console.log(`---------------------------------------`)
        } catch (error) {
          console.log(`---------------------------------------`)
          console.log(` >>>>>>>>>>>>>>> GITHUB API ERROR (FOR AUTHENTICATED USER) IS : `)
          console.log(error);
          console.log(`---------------------------------------`)
        }
        let retrievedGithubOrganizations: any[] = []
        try {
          const [githubApiUserOrgsResponse] = await axios.all([
            axiosService.get('/user/orgs')
          ]);
          console.log(`---------------------------------------`)
          console.log(` >>>>>>>>>>>>>>> GITHUB API RESPONSE (FOR AUTHENTICATED USER ORGANIZATIONS) IS : `)
          console.log(githubApiUserOrgsResponse.data);
          console.log(`---------------------------------------`)
          retrievedGithubOrganizations = githubApiUserOrgsResponse.data
        } catch (error) {
          console.log(`---------------------------------------`)
          console.log(` >>>>>>>>>>>>>>> GITHUB API ERROR (FOR AUTHENTICATED USER ORGANIZATIONS) IS : `)
          console.log(error);
          console.log(`---------------------------------------`)
        }

        /*
        retrievedGithubOrganizations.forEach( githubOrg => {
          if (githubOrg.login == `${process.env.AUTHORIZED_GITHUB_ORG}`) {

          }
        });
        */
        for (let loopIndex: number = 0; loopIndex < retrievedGithubOrganizations.length; loopIndex++ ) {
          if (retrievedGithubOrganizations[loopIndex].login === `${process.env.AUTHORIZED_GITHUB_ORG}`) {
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !!!!!!!`)
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !!!!!!!`)
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !!!!!!!`)
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !!!!!!!`)
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !! Indeed I found the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization at array index [${loopIndex}] in [retrievedGithubOrganizations]`)
            console.log(` LOOP => Ok!!!! You WILL BE AUTHORIZED ACCESSING THE HUGO STATIC SITE !!!!!!!`)
            isUserInGithubOrg = true;
            break;
          }
        }
        if (isUserInGithubOrg) {
          return next();
        } else {
          console.log(` NOOOPEEE!!!! You WILL NOT BE AUTHORIZED ACCESSING THE HUGO STATIC SITE BECAUSE YOU ARE NOT A MEMBER OF the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization !!!!!!!`)
          console.log(` NOOOPEEE!!!! You WILL NOT BE AUTHORIZED ACCESSING THE HUGO STATIC SITE BECAUSE YOU ARE NOT A MEMBER OF the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization !!!!!!!`)
          console.log(` NOOOPEEE!!!! You WILL NOT BE AUTHORIZED ACCESSING THE HUGO STATIC SITE BECAUSE YOU ARE NOT A MEMBER OF the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization !!!!!!!`)
          console.log(` NOOOPEEE!!!! You WILL NOT BE AUTHORIZED ACCESSING THE HUGO STATIC SITE BECAUSE YOU ARE NOT A MEMBER OF the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization !!!!!!!`)
          console.log(` NOOOPEEE!!!! You WILL NOT BE AUTHORIZED ACCESSING THE HUGO STATIC SITE BECAUSE YOU ARE NOT A MEMBER OF the [${process.env.AUTHORIZED_GITHUB_ORG}] Github Organization !!!!!!!`)
          // res.redirect('/login')
          res.redirect('/403')
        }
      }

      res.redirect('/login')
      // res.redirect('/login')

      /// CET APPEL LÀ, IL  MARCHE :
      /* try {
        const [response1, response2] = await axios.all([
          axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2020-03-18'),
          axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=2020-03-17')
        ]);
        console.log(response1.data.url);
        console.log(response1.data.explanation);

        console.log(response2.data.url);
        console.log(response2.data.explanation);
      } catch (error) {
        console.log(error.response.body);
      } */
      /// */

      // if (req.isAuthenticated()) { return next(); }; // isAuthenticated() comes from Passport

      // res.redirect('/login')

    });
  }
export default PokusMiddleware
