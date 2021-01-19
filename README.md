# Spam
![Deploy Action](.github/workflows/deploy.yml/badge.svg)


A system for sending emails located at [spam.datasektionen.se](https://spam.datasektionen.se).

To send emails you need an API key which can be generated
through the permission system [pls](https://pls.datasektionen.se).
The key needs to have the permission `send` in the `spam` system.

### Example Request
#### `POST /api/sendmail?api_key=ABC...`
```json
{
  "from": "no-reply@datasektionen.se",
  "to": [
    "foo@example.com",
    "bar@example.com"
  ],
  "subject": "Test email title",
  "content": "# Menu\n - Egg, bacon and spam\n - Spam, bacon, sausage and spam"
}
```

Where the API key is sent as the query parameter `api_key`.

## Develop
### Environment variables
| Variable | Description                     | Example                        | Default                 |
|----------|---------------------------------|--------------------------------|-------------------------|
| PLS_HOST | URL to permission service `pls` | `https://pls.datasektionen.se` | `http://localhost:5000` |


### Install
To install dependencies, run:
```bash
npm i
```

### Serverless
The Serverless Framework is used to deploy the service to AWS.

The configuration can be found in [serverless.yml](serverless.yml).
It automatically configures Amazon API Gateway and the AWS Lambdas.

To connect Serverless to AWS, run:
```bash
serverless login
```

To deploy, run either:
```bash
npm run deploy      # builds src and deploys to dev stage
npm run deploy:prod # builds src and deploys to prod stage
```

It will be deployed to the `org` specified in [serverless.yml](serverless.yml)
so if you want to deploy to your personal account you may have to change
that value.

Once you have deployed a stage you can enter a parameter called `PLS_HOST` there.
Keep in mind that emails are not actually going to be sent in `dev` or `test`
environments and if you want to send actual emails you need to verify an email
address through Amazon SES and temporarily add it to the list of verified addresses
in [models/email.yml](models/email.yml). 

If you would rather run locally:
```bash
npm run local         # builds src and run locally
npm run local:no-auth # bypasses authenication step
```

By default, that will open the service at [`http://localhost:3000/local/api/`](http://localhost:3000/local/api/).

### pls
The permission system [pls](https://pls.datasektionen.se) is used to handle authentication.
For local development, if you don't have an API key, you can either bypass the authentication step completely, or
you can run a local instance of **pls**.

To run a local pls instance you can download the source code from its [repo](https://github.com/datasektionen/pls).
Follow the [`README.md`](https://github.com/datasektionen/pls#readme) to install and start the server. It will automatically run at [`http://localhost:5000`](http://localhost:5000).

To create a valid token you will need to enter the following commands:

```elixir
Pls.Queries.Group.add_permission "spam", "send"
Pls.Queries.Token.add_token "<tag>", "spam"
```

with some value `<tag>`. An example with the tag `test` should return a token on the format:

`token: test-IxRRnRDViM84QzcChkWJj1egO_OCvWg7AVhJiGSYRMI`.
  
### Workflow
![AWS Diagram](https://i.imgur.com/fv5n13r.png)

When sending a request to spam it will first hit the Amazon API Gateway and 
the `api_key` will be checked against pls to see that the sender has the 
correct permission. The result will be cached. 

If they do have the correct permissions, the request will be checked against 
a [JSON Schema](https://json-schema.org/) to make sure the request body has 
the correct format. Including all required fields and that the email addresses 
have the correct format and sent from a verified address.

If all that is in order the request will be sent to the Lambda which will send an email.

### Email Templates
The optional field `template` corresponds to an `.ejs` template in
the [`emails/`](/emails) folder. Currently, the ones available 
are:
 - `default`
 - `empty` 

To create another template, simply add another subfolder of the name 
you want and add it to [`models/email.yml`](/models/email.yml) in 
the list of allowed templates. 
Also, please update the list above accordingly.

---
![spam](http://media.boingboing.net/wp-content/uploads/2016/01/Spam-Can.jpg)
