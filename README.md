
# SAP Cloud Foundry - Node.js XSUAA example

This is a "Hello XSUAA" application for the SAP Cloud Platform Cloud Foundry Environment that shows how to __use the XSUAA service to secure a REST API__. This code example is based on the [official HelloWorld](https://github.com/SAP/cloud-cf-helloworld-nodejs), you can check out the different branches for step-by-step advice. I simplified some parts, for instance no Postgres Service is needed, so that you can deploy the application on your SAP Cloud Platform trial Account.



## Prerequisites - What you need to get started:
- SAP Cloud Platform account, a trial account is sufficient. [https://cockpit.hanatrial.ondemand.com/](https://cockpit.hanatrial.ondemand.com/)
- Node.js skills
- Basic knowledege about Authentification, Authorization, UAA, JWT ...


## Versions
There are two versions for now. One will show a really simple application using Express to provide a simple REST API. Version two will use the SAP Approuter to redirect users to a login screen, if they are not logged-in yet.

# Version 1
- Stage 1 shows how to implement simple authentication with the UAA Service for a REST API - to authenticate you need to retrieve a token from the UAA Service Endpoint
- Stage 2 is an advanced example of stage 1 with access restrictions through roles and scopes


# Version 2
- Stage 1 shows how to leverage the approuter to implement a authentication flow - to authenticate the approuter redirects the user to a login screen
- Stage 2 is an advanced example of stage 1 with access restrictions through roles and scopes

__Check out the Branches of this Repository for the different Versions!__