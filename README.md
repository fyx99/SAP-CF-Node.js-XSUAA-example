
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
npm install express passport @sap/xssec @sap/xsenv @sap/approuter --save
```
Especially important is the __manifest.yml__ file. This will contain some options for CF. There you bind your xsuaa service to your application. So make sure, that the naming of the service is constant, as for the example: 'cf-xsuaa-example'. __You need to change the name and host to a unique string__. In comparison to version 1, we add another application in the manifest.yml - the approuter. Therefore we reference the path `/approuter` in which we have a `package.json` an the configuration file for the approuter `xs-app.json`.
For this version the start command in the package.json of the approuter folder has to point to the SAP Approuter node module. What this does is, it will handle the login and forward the user through the specified route to the main application, including the generated JWT token.

```YAML
  "scripts": {
    "start": "node node_modules/@sap/approuter/approuter.js"
  }
```

The authentication action happens in the `server.js` file with the following lines of code:
```JAVASCRIPT
const services = xsenv.getServices({ uaa: 'cf-xsuaa-example' });
passport.use(new JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));
```
This will add the middleware that checks if a authorization header is present and if not gives a Error before the user can access the routes.

You can deploy this example to your space using `cf push` and take a look in the logs of the application with `cf logs cf-node-xsuaa-v1 --recent`.

### Query REST API

Finally we can request our API through a browser. A login screen will load and we can put our Cloud Platform credentials in. This will redirect to our application through the specified route with the needed authorization headers.

Now you should be able to check out the content of the JWT token in the application log. The user is therefore authenticated.
As an application developer you can see who is your user and which roles he is assigned to, for instance "Subaccount Administrator". This information can be used to do some advanced authorization checks.

To build up on that, I will provide a stage 2 of this example with access restrictions, roles and will touch on a basic example how to use App Router and the xs-apps.json file to set all of this up. If you do not want to use tokens, because you provide a UI or something, check out Version 2.
