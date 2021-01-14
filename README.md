# Spam

A system for sending emails located at [spam.datasektionen.se](https://spam.datasektionen.se).

To send emails you need an API key which can be generated
through the permission system [pls](https://pls.datasektionen.se).
The key needs to have the permission `send` in the `spam` system.

### Example Request
#### `GET /api/sendmail?api_key=ABC...`
```json
{
  "from": "no-reply@datasektionen.se",
  "to": [
    "foo@example.com",
    "bar@example.com"
  ],
  "subject": "Test email title",
  "content": "# Menu\n - Egg, bacon and spam\n- Spam, bacon, sausage and spam"
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
It automatically configures AWS API Gateway and the AWS Lambdas.

To connect Serverless to AWS, run:
```bash
serverless login
```

To deploy, run either:
```bash
npm run deploy      # builds src and deploys to dev stage
npm run deploy:prod # builds src and deploys to prod stage
```

Once you have deployed a stage you can enter a parameter called `PLS_HOST` there.

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
Follow the `README.md` to install and start the server. It will automatically run at [`http://localhost:5000`](http://localhost:5000).

To create a valid token you will need to enter the following commands:

```elixir
Pls.Queries.Group.add_permission "spam", "send"
Pls.Queries.Token.add_token "<tag>", "spam"
```

with some value `<tag>`. An example with the tag `test` could return a token on the format: `token: test-IxRRnRDViM84QzcChkWJj1egO_OCvWg7AVhJiGSYRMI`.
  





-----

if you want to try to send actual emails - 
you may have to verify address through aws.


---
![spam](http://media.boingboing.net/wp-content/uploads/2016/01/Spam-Can.jpg)
