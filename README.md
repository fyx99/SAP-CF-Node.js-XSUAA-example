
# SAP Cloud Foundry - Node.js XSUAA example

This is a "Hello XSUAA" application for the SAP Cloud Platform Cloud Foundry Environment that shows how to __use the XSUAA service to secure a REST API__. This code example is based on the [official HelloWorld](https://github.com/SAP/cloud-cf-helloworld-nodejs), you can check out the different branches for step-by-step advice. I simplified some parts, for instance no Postgres Service is needed, so that you can deploy the application on your SAP Cloud Platform trial Account.



## Prerequisites - What you need to get started:
- SAP Cloud Platform account, a trial account is sufficient. [https://cockpit.hanatrial.ondemand.com/](https://cockpit.hanatrial.ondemand.com/)
- Node.js skills
- Basic knowledege about Authentification, Authorization, UAA, JWT ...
- Some resistance to frustration



## Versions

There are two versions for now. One will show a really simple application using Express to provide a simple REST API. Version two will use the SAP Approuter to redirect users to a login screen, if they are not logged-in yet.
Stage 2 will show how to restrict access to the API.

### Version 1 Stage 2

To get this application running, I use the Cloud Foundry CLI. When installed and connected to your subaccount and choosen the space, you need to __create an instance of the XSUAA Service__. To do this, one could also use the SCP Cockpit UI, but the best way is using a `xs-security.json` file to provide the necesary settings.
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
In the file different roles are specified. For instance a NormalUser has the scope to display information, the Admin is allowed to the scope of editing information. 

To create the XSUAA Service use:
```
cf create-service xsuaa application cf-xsuaa-example -c xs-security.json
```
This will create a XSUAA Service with the application plan, named cf-xsuaa-example using the settings from the file.
Now you can need to create 2 role collections NormalUserRC and AdminRC, and add the role to it. Then you assign your SCP User to one of the Role Collections. This is done through the cockpit UI.
To create a role collection go to `Trial Home / trialacc / subaccount / security / role collections` and New Role Collection. Then click on it and Add Role - choose NormalUser or Admin.
Then head to `/ Trust Configuration` press the sap.default Identity Provider - there type your user/email `Show Assignments` and `Assign Role Collection`. There just add NormalUserRC for now.


### Project structure


The autorization happens in the `server.js` file with the following lines of code:
```JAVASCRIPT
//normal users are allowed to "get"
app.get("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('DisplayInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).end('Forbidden');
    }
    res.send("works");
});

//admin area
app.put("/access-restricted", function (req, res) {
    if (!req.authInfo.checkLocalScope('ChangeInformation')) {
        console.log('Missing the expected scope');
        return res.status(403).end('Forbidden');
    }
    res.send("works");
});
```
This will check if the user has the scope to access the endpoint.

You can deploy this example to your space using `cf push` and take a look in the logs of the application with `cf logs cf-node-xsuaa-v1 --recent`.

### Retrieve Access Token From XSUAA Service

*Same as in Version 1 -> go to Branch V1 to see how you get your token to Query the API*
If you want you can specify for which scope the token should be retrieved. Just put the xsappname.Scope in scope. The xsappname can be found in the environment variables `cf env cf-node-xsuaa-v1`

### Query REST API with Authorization Header

Put the token in the Authorization header of the request. The request will look as follows:
```HTTP
PUT https://host:port/restricted-access HTTP/1.1
Authorization: Bearer eytluvzifeor3984pgh3rg3rü9rhvöutrdz <- your token (expires after 12 hours)
```
If you assigned the NormalUser Role Template to your user, you will experience, that you are not allowed in. Check out the application log for details.


In Version 2 and its stages you can take a look how to use the approuter to automatically get a token through a login screen and perform static checks for scopes.
