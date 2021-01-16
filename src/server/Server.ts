// import * as express from 'express'
import express, { Request, Response } from 'express';
import { Application } from 'express';
import githubAuth from './auth/github/';
// import * as express_session from 'express-session';
import Session from 'express-session';
import * as body_parser from 'body-parser';
import * as method_override from 'method-override';
import partials from 'express-partials';
import PokusMiddleware from './permissions/pokus/github';


class GhallagherServer {

    public app: Application
    public port: number
    public fqdn: string
    // public passportService: githubAuth.PassportStatic;// ...?
    /// public passport = require('passport');
    constructor(appInit: { fqdn: string; port: number; middleWares: any[]; controllers: any[]; }) {
        this.app = express()
        this.fqdn = appInit.fqdn
        this.port = appInit.port


        this.app.use(partials());
        this.app.use(body_parser.urlencoded({ extended: true }));
        this.app.use(body_parser.json());
        this.app.use(method_override.default());
        this.app.use(Session({
          secret: 'keyboard cat',
          resave: false, saveUninitialized: false,
          cookie: {
            secure: false // set true if HTTPS is enabled
          }
        }));

        this.passportSetup();
        // this.loadGithubOAuthRoutes();
        this.middlewares(appInit.middleWares)
        this.routes(appInit.controllers)
        this.loadStaticRoutes()
    }
    private passportSetup() {

      this.app.use(githubAuth.initialize());
      this.app.use(githubAuth.session());
    }

    private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
        middleWares.forEach(middleWare => {
            this.app.use(middleWare)
        })
    }

    private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
        controllers.forEach(controller => {
            this.app.use('/backend', controller.router)
        })
    }
    private loadGithubOAuthRoutes(){

      this.app.get('/login', (req, res) => {
        res.render('login', { user: req.user });
      });


      this.app.get('/account', (req, res, next) => {
        if (req.isAuthenticated()) { return next(); }; // isAuthenticated() comes from Passport
        res.redirect('/login')
      }, (req, res) => {
        res.render('account', { user: req.user });
      });



      // GET /auth/github
      //   Use githubAuth.authenticate() as route middleware to authenticate the
      //   request.  The first step in GitHub authentication will involve redirecting
      //   the user to github.com.  After authorization, GitHub will redirect the user
      //   back to this application at /auth/github/callback
      this.app.get('/auth/github',
        githubAuth.authenticate('github', { scope: [ 'user:email read:org' ] }),
        function(req, res){
          // The request will be redirected to GitHub for authentication, so this
          // function will not be called.
        });

      // GET /auth/github/callback
      //   Use githubAuth.authenticate() as route middleware to authenticate the
      //   request.  If authentication fails, the user will be redirected back to the
      //   login page.  Otherwise, the primary route function will be called,
      //   which, in this example, will redirect the user to the home page.
      this.app.get('/auth/gh/verte/callback',
         // githubAuth.authenticate('github', { failureRedirect: '/login' }),
         githubAuth.authenticate('github', { failureRedirect: '/403' }),
        (req, res) => {
          res.redirect('/');
        });

      this.app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
      });

      this.app.get('/403', (req, res) => {
        let errMsg: string = '';
        let JSONdataForResponse = { };
        if (req.isAuthenticated()) {
          errMsg = `you are not a member of the [${process.env.AUTHORIZED_GITHUB_ORG}] Github organization`;
          JSONdataForResponse = {
            user: req.user, // user property is there just because it is required by the [views/layout.ejs] template
            error: errMsg
          }
        } else {
          errMsg = `you are not a member of the [${process.env.AUTHORIZED_GITHUB_ORG}] Github organization, because you are not even authenticated against Github!`;
          JSONdataForResponse = {
            user: null, // user property is there just because it is required by the [views/layout.ejs] template
            error: errMsg
          }
        }
        res.status(403);
        res.format({
          html: function () {
            res.render('403', JSONdataForResponse)
          },
          json: function () { // In case I replace  EJS templates by an HTML Page request JSON mime type instead of HTML
            res.json(JSONdataForResponse)
          },
          default: function () { // In case it's just curl
            res.type('txt').send(errMsg)
          }
        })

      });



    }
    private loadStaticRoutes() {
      this.app.use('/', express.static('public'))
      // this.app.use('/', new PokusMiddleware().checkUserIsInGithubOrg, express.static('public'))

        // this.app.use(express.static('hugo'))
    }
    /*
    private ensureAuthenticated (req: Request<ParamsDictionary, any, any, QueryString.ParsedQs>, res: Response<any, number>, next: NextFunction) {
      if (req.isAuthenticated()) { return next(); }; // isAuthenticated() comes from Passport
      res.redirect('/login')
    }*/
    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the http://${this.fqdn}:${this.port}`)
        })
    }
}



export default GhallagherServer
