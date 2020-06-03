
# SAP Cloud Foundry - Node.js XSUAA example

This is a "Hello XSUAA" application for the SAP Cloud Platform Cloud Foundry Environment that shows how to __use the XSUAA service to secure a REST API__. This code example is based on the [official HelloWorld](https://github.com/SAP/cloud-cf-helloworld-nodejs), you can check out the different branches for step-by-step advice. I simplified some parts, for instance no Postgres Service is needed, so that you can deploy the application on your SAP Cloud Platform trial Account.



## Prerequisites - What you need to get started:
- SAP Cloud Platform account, a trial account is sufficient. [https://cockpit.hanatrial.ondemand.com/](https://cockpit.hanatrial.ondemand.com/)
- Node.js skills
- Basic knowledege about Authentification, Authorization, UAA, JWT ...
- Some resistance to frustration



## Versions

There are two versions for now. One will show a really simple application using Express to provide a simple REST API. Version two will use the SAP Approuter to redirect users to a login screen, if they are not logged-in yet.

### Version 2

To get this application running, I use the Cloud Foundry CLI. When installed and connected to your subaccount and choosen the space, you need to __create an instance of the XSUAA Service__. To do this, one could also use the SCP Cockpit UI, but the best way is using a `xs-security.json` file to provide the necesary settings. If you just want to authenticate your users, go with the following basic content of the file. 
``` JSON
{
    "xsappname": "cf-xsuaa-example",
    "tenant-mode": "dedicated"
}
```

To create the XSUAA Service use:
```
cf create service xsuaa application cf-xsuaa-example -c xs-security.json
```
This will create a XSUAA Service with the application plan, named cf-xsuaa-example using the settings from the file.

### Project structure
Get your project ready with the following dependencies:
```
npm init
npm install express passport @sap/xssec @sap/xsenv --save
```
Especially important is the __manifest.yml__ file. This will contain some options for CF. There you bind your xsuaa service to your application. So make sure, that the naming of the service is constant, as for the example: 'cf-xsuaa-example'. __You need to change the name and host to a unique string__.

The action happens in the `server.js` file with the following lines of code:
```JAVASCRIPT
const services = xsenv.getServices({ uaa: 'cf-xsuaa-example' });
passport.use(new JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));
```
This will add the middleware that checks if a authorization header is present and if not gives a Error before the user can access the routes.

You can deploy this example to your space using `cf push` and take a look in the logs of the application with `cf logs cf-node-xsuaa-v1 --recent`.
There you can obtain the parsed JWT Token, when you request the `/auth-info` endpoint with the access token. For now you will just get a `401 Unauthorized` Error.

### Retrieve Access Token From XSUAA Service

To access this API we are going to query the UAA Endpoint and provide credentials to retrieve a access token. There are different approches to get access to a UAA secured API, you can find more Information about that on [Cloud Foundry documentation](https://docs.cloudfoundry.org/api/uaa/).

Informations about the XSUAA Service Endpoint are displayed in the SCP Cockpit `Trial Home / your trial account / subaccount / space / Authorization & Trust Management / cf-xsuaa-example` or just check out the env variables of your application with the CLI command `cf env cf-node-xsuaa-v1` with respect to your unique application name - referenced in the manifest.yml file. This sample JSON shows the VCAP_SERVICES Object with the xsuaa service and my (censored) credentials. We need the following information to get the token.

```YAML
{
 "VCAP_SERVICES": {
  "xsuaa": [ {
    "credentials": {
     "clientid": "sb-cf-xsuaa-example!t48462",
     "clientsecret": "/tiJcensored*iGI=",
     "url": "https://2censored*trial.authentication.eu10.hana.ondemand.com",
     .....
    } } ] }
}
```

The Endpoint we are going to request is `https://2censored*trial.authentication.eu10.hana.ondemand.com/oauth/token`, so the url field in credentials attached __/oauth/token__. Due to the fact, that we are using the standard SAP identity provider, we just need the username and the password of the Cloud Platform account to retrieve the token with the request below:

```HTTP
###
POST https://2censored*trial.authentication.eu10.hana.ondemand.com/oauth/token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=password
&username=*your username, in scp trial your email*
&password=*your user password*
&scope=
&client_id=*your client id*
&client_secret=*your client secret*
```
Username and Password for your Identity Provider like the standard SCP User and the clientId and clientSecret from above.
And the Result should look like this:

```YAML
{
  "access_token": "ey.... your token",
  "token_type": "bearer",
  "id_token": "ey.... your token",
  "refresh_token": "your refresh token",
  "expires_in": 43199,
  "scope": "openid",
  "jti": "your jti"
}
```
In the repo I also provide a Postman request, which contains this example. I recommend REST Client for VS Code to run the requests.

### Query REST API with Authorization Header

Finally we can put the token in the Authorization header of our request. The request will look as follows:
```HTTP
GET https://host:port/auth-info HTTP/1.1
Authorization: Bearer eytluvzifeor3984pgh3rg3rü9rhvöutrdz <- your token (expires after 12 hours)
```
Now you should be able to check out the content of the jwt token in the application log. The user is therefore authenticated.
As an application developer you can see who is your user and which roles he is assigned to, for instance "Subaccount Administrator". This information can be used to do some advanced authorization checks.

To build up on that, I will provide a stage 2 of this example with access restrictions, roles and will touch on a basic example how to use App Router and the xs-apps.json file to set all of this up. If you do not want to use tokens, because you provide a UI or something, check out Version 2.
