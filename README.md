
# SAP Cloud Foundry - Node.js XSUAA example

This is a "Hello XSUAA" application for the SAP Cloud Platform Cloud Foundry Environment that shows how to __use the XSUAA service to secure a REST API__. This code example is based on the [official HelloWorld](https://github.com/SAP/cloud-cf-helloworld-nodejs), you can check out the different branches for step-by-step advice. I simplified some parts, for instance no Postgres Service is needed, so that you can deploy the application on your SAP Cloud Platform trial Account.



## Prerequisites - What you need to get started:
- SAP Cloud Platform account, a trial account is sufficient. [https://cockpit.hanatrial.ondemand.com/](https://cockpit.hanatrial.ondemand.com/)
- Node.js skills
- Basic knowledege about Authentification, Authorization, UAA, JWT ...
- Some resistance to frustration



## Versions

There are two versions for now. One will show a really simple application using Express to provide a simple REST API. Version two will use the SAP Approuter to redirect users to a login screen, if they are not logged-in yet.

### Version 2 Stage 2

To get this application running, I use the Cloud Foundry CLI. When installed and connected to your subaccount and choosen the space, you need to __create an instance of the XSUAA Service__. To do this, one could also use the SCP Cockpit UI, but the best way is using a `xs-security.json` file to provide the necesary settings. If you just want to authenticate your users, go with the following basic content of the file. 
``` YAML
{
    "xsappname": "cf-xsuaa-example",
    "tenant-mode": "dedicated",
    "scopes": [
        {
            "name": "$XSAPPNAME.DisplayInformation",
            "description": "Look at Information"
        },
        {
            "name": "$XSAPPNAME.ChangeInformation",
            "description": "Alter Information"
        }
    ],
    "role-templates": [
        {
            "name": "NormalUser",
            "description": "Read Access",
            "scope-references": [
                "$XSAPPNAME.DisplayInformation"
            ]
        },
        {
            "name": "Admin",
            "description": "Allowed to to anything",
            "scope-references": [
                "$XSAPPNAME.DisplayInformation",
                "$XSAPPNAME.ChangeInformation"
            ]
        }
    ]
}
```

To create the XSUAA Service use:
```
cf create-service xsuaa application cf-xsuaa-example -c xs-security.json
```
This will create a XSUAA Service with the application plan, named cf-xsuaa-example using the settings from the file.
Now you can need to create 2 role collections NormalUserRC and AdminRC, and add the role to it. Then you assign your SCP User to one of the Role Collections. This is done through the cockpit UI.
To create a role collection go to `Trial Home / trialacc / subaccount / security / role collections` and New Role Collection. Then click on it and Add Role - choose NormalUser or Admin.
Then head to `/ Trust Configuration` press the sap.default Identity Provider - there type your user/email `Show Assignments` and `Assign Role Collection`. There just add NormalUserRC for now.

### Project structure

In the xs-app.json file the following code is added:
```YAML
{
    "routes": [
        {
            "source": "^/(.*)$",
            "destination": "api-destination",
            "scope": {
                "GET": [
                    "$XSAPPNAME.DisplayInformation",
                    "$XSAPPNAME.ChangeInformation"
                ]
            }
        },
        {
            "source": "^/admin/(.*)$",
            "destination": "api-destination",
            "scope": {
                "GET": [
                    "$XSAPPNAME.ChangeInformation"
                ]
            }
        }
    ]
}
```
The first rout will need the scopes Display or ChangeInformation, for the second one the DisplayInformation Scope is not sufficient.
The Approuter will check these scopes before redirecting to the specified destination. As you can see, both user templates can access the `/access-restricted` endpoint, but only the admin will be able to query the `/admin/access-restricted` endpoint.

You can deploy this example to your space using `cf push` and take a look in the logs of the application with `cf logs cf-node-xsuaa-v1 --recent`.

### Query REST API

Finally we can request our API through a browser. A login screen will load and we can put our Cloud Platform credentials in. This will redirect to our application through the specified route with the needed authorization headers.

If you have the NormalUserRC assigned, you get  `403 Forbidden` Error message for the `/access-restricted-admin` endpoint.

To build up on that, I will provide a stage 2 of this example with access restrictions, roles and will touch on a basic example how to use App Router and the xs-apps.json file to set all of this up. If you do not want to use tokens, because you provide a UI or something, check out Version 2.
