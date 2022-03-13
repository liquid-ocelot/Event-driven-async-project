# Event-driven-async-project

# SETUP

For this application you will need a postgresql database.

To run this application, first clone this repo, run `npm i` to install the necessery packages.

Then you'll need to set environment variable or create a .env file at the root of the project with the following keys:
```
FASTIFY_PORT=
FASTIFY_LOGGING=
FASTIFY_LOGGING_COLORIZE=
FASTIFY_LOGGING_SINGLE_LINE=
FASTIFY_LOGGING_PATH=


DATABASE_HOST = 
DATABASE_PORT =
DATABASE_USER = 
DATABASE_PASS = 
DATABASE_NAME = 
DATABASE_LOGGING = 
DATABASE_SYNC =

COOKIE_NAME =
COOKIE_SECRET =
COOKIE_SIGNED =
COOKIE_HTTP_ONLY =
COOKIE_SECURE =
COOKIE_MAX_AGE =
```

Then build the project using `npm run build`

And finally you can use `npm run start` to run the application 

# Checkpoints report for the project

You **MUST** append a filled copy of this document at the end of your `README.MD`.

This document serves three main purposes:

- providing you a clear list of my expectations (check each point when done) ;
- ensuring I do not miss some of your engineering during the review ;
- asking for additional information that helps me during the review.

## Notice

Check every applicable checkbox in the above list. For each one, provide the requested additional information.

In your explanation, please provide links (file + line) to relevant parts of your source code and tests if applicable.

### Caption

🔵 means the checkbox is mandatory. If missing or absolutely not satisfying, it may cost you 0.5 penalty point.

## Expectations

### Input validation

- [x] Strictly and deeply validate the type of every input (`params, querystring, body`) at runtime before any processing. **[1 point]** 🔵

  > How did you achieve this?

  For that we used JSON schemas, which fastify uses to check if the inputs are right

- [x] Ensure the type of every input can be inferred by Typescript at any time and properly propagates across the app. **[1 point]** 🔵

  > How did you achieve this?

  We inferred the type by using ones of fastify functionnalities, for example this code `fastify.post<{ Body: UserBody }>` will infered the body as a UserBody, a type specified in the code  

- [x] Ensure the static and runtime input types are always synced. **[1 point]** 🔵
  > How did you achieve this? If extra commands must be run before the typescript checking, how do you ensure there are run?

  For that we used the package json-schema-to-typescript, it will take our json for input validation and create corresponding types, in our project the command `npm run compile-schemas` need to be run to sync the types to the json files

### Authorisation

- [x] Check the current user is allowed to call this endpoint. **[1 point]** 🔵

  > How did you achieve this?

  We have basicaly two types of routes, the user routes that are available to everyone, and game routes that can ask for authentication.
  For the later routes we put prehandler that will call the checkAuth function to see if the user is authenticated

- [x] Check the current user is allowed to perform the action on a specific resource. **[1 point]** 🔵

  > How did you achieve this?

  In our API, the main ressources are games, when an user create a game its id will be stored as the creator of the game, thus only him will be able to invite other player or generate a map on this game


- [ ] Did you build or use an authorisation framework, making the authorisation widely used in your code base? **[1 point]**

  > How did you achieve this?

- [ ] Do you have any way to ensure authorisation is checked on every endpoint? **[1 point]**
  > It is pretty easy to forget authorising some action.
  > For obvious reasons, it may lead to security issues and bugs.
  > At work, we use `varvet/pundit` in our `Ruby on Rails` stack. It can raise exception just before answering the client if authorisation is not checked.
  > https://github.com/varvet/pundit#ensuring-policies-and-scopes-are-used
  >
  > How did you achieve this?

### Secret and configuration management

- [x] Use a hash for any sensitive data you do not need to store as plain text. 🔵

  > Also check this if you do not store any password or such data (and say it here).

  Our application use authentication, so we store hashed password in the database, using bcrypt to generate the hash

- [x] Store your configuration entries in environment variables or outside the git scope. **[1 point]** 🔵

  > How did you achieve this?

  creating an .env file, that will not be commited nor pushed by git

- [x] Do you provide a way to list every configuration entries (setup instructions, documentation, requireness... are appreciated)? **[1 point]**

  > How did you achieve this?

  We give in the readme file setup instructions with a .env template

- [x] Do you have a kind of configuration validation with meaningful error messages? **[1 point]**
  > How did you achieve this?

  When starting the application, we load the environment variables into variables and use the following function
  ```ts
  function getOrThrow(name: string) {
    const val = process.env[name]
    if (typeof val === 'undefined') throw new Error(`Missing mandatory environment variable ${name}`)
    return val
  }
  ``` 
to tell the user about missing variable

### Package management

- [x] Do not use any package with less than 50k downloads a week. 🔵

- [ ] Did you write some automated tools that check no unpopular dependency was installed? If yes, ensure it runs frequently. **[1 point]**

  > How did you achieve this? A Github Action (or similar) and compliance rule for pull requests are appreciated.

- [x] Properly use dependencies and devDevepencies in your package.json. **[0.5 points]**
  > How did you achieve this?

  We used not a lot of dependencies, so it was easy to keep an eye on dependencies and devDependencies. The devDependencies includes type definition (only used in dev as the typescript is transpiled to javascript), testing dependencies and typescript related dependencies

  ```json
  "devDependencies": {
      "@types/bcrypt": "^5.0.0",
      "@types/chai": "^4.3.0",
      "@types/mocha": "^9.1.0",
      "@types/node": "^15.12.2",
      "@typescript-eslint/eslint-plugin": "^5.3.0",
      "@typescript-eslint/parser": "^5.3.0",
      "chai": "^4.3.6",
      "eslint": "^8.2.0",
      "json-schema-to-typescript": "^10.1.5",
      "mocha": "^9.2.1",
      "nyc": "^15.1.0",
      "pino-pretty": "^7.5.3",
      "ts-node": "3.3.0",
      "typescript": "^4.3.2"
   },
   "dependencies": {
      "bcrypt": "^5.0.1",
      "cookie-signature": "^1.2.0",
      "dotenv": "^8.6.0",
      "fastify": "^3.24.1",
      "fastify-cookie": "^5.3.2",
      "fastify-swagger": "^5.0.0",
      "pg": "^8.4.0",
      "pino": "^7.8.1",
      "reflect-metadata": "^0.1.10",
      "typeorm": "0.2.41"
   },
   "_moduleAliases": {
      "CppGenerator": "./CppGenerator.node"
   }
  ```

### Automated API generation

- [x] Do you have automated documentation generation for your API (such as OpenAPI/Swagger...)? **[1 point]** 🔵

  > How did you achieve this?

  installing fastify-swagger, then registering swagger as a route.

  > You must link your documentation for review (a Github page, a ZIP archive, an attachment to the release notes...).

- [ ] In addition to requireness and types, do you provide a comment for every property of your documentation? **[1 point]**

  > How did you achieve this?

- [ ] Do you document the schema of responses (at least for success codes) and provide examples of payloads? **[1 point]**

  > How did you achieve this?

- [ ] Is your documentation automatically built and published when a commit reach the develop or master branches? **[1 point]**
  > How did you achieve this?

### Error management

- [x] Do not expose internal application state or code (no sent stacktrace in production!). **[1 point]** 🔵

  > How did you achieve this?

  We set a custom error handler that will truncate the message in case of an error 500

  ```ts
  .setErrorHandler(function defaultErrorHandler(error, request, reply) {
		if (reply.statusCode < 500) {
			reply.log.info({ res: reply, err: error }, error && error.message);
			void reply.send(error);
		} else {
			reply.log.error({ req: request, res: reply, err: error }, error && error.message);
			void reply.send({ statusCode: 500, error: "Internal Server Error", message: "[TRUNCATED]" });
		}
	})
  ```

- [ ] Do you report errors to Sentry, Rollbar, Stackdriver… **[1 point]**
  > How did you achieve this?

### Log management

- [x] Mention everything you put in place for a better debugging experience based on the logs collection and analysis. **[3 points]**

  > How did you achieve this?

  Fastify includes pino as a logger but it seems not entirely (some types definitions are missing, and fastify devs don't want to redo all the work of pino), so installing pino gives access to all the type definition.
  ```ts
  const logger = pino.pino({
	enabled: FASTIFY_LOGGING,
	level:"info",
	redact:['req.headers.authorization', 'req.body.password']
}, pretty_dest)
  ``` 

  one of the interesting option is 'redact', it allows to remove sensitive data from the logs.

  Moreover we added pino-pretty that helps to format the log in a more readable way.
  And we print the log into a file instead of the console

- [x] Mention everything you put in place to ensure no sensitive data were recorded to the log. **[1 point]**
  > How did you achieve this?




### Asynchronous first

- [x] Always use the async implementations when available. **[1 point]** 🔵

  > List all the functions you call in their async implementation instead of the sync one.
  >
  > Ex: I used `await fs.readFile` in file `folder/xxx.ts:120` instead of `fs.readFileSync`.

  In userman.ts, the bcrypt function exists in sync and async, we used the async one.

- [x] No unhandled promise rejections, no uncaught exceptions… **[1 point]** 🔵
  > For example, how do you ensure every promise rejection is caught and properly handled?
  > Tips: one part of the answer could be the use of a linter.

  When a promise is rejected we send an error 500, we consider that the request failed due to an server error, we also used ESlint to highlight possible problems in our code

### Code quality

- [ ] Did you put a focus on reducing code duplication? **[1 point]**

  > How did you achieve this?

- [ ] Eslint rules are checked for any pushed commit to develop or master branch. **[1 point]**
  > Please provide a link to the sample of Github Action logs (or similar).

### Automated tests

- [x] You implemented automated specs. **[1 point]** 🔵

  > Please provide a link to the more complete summary you have.

- [x] Your test code coverage is 75% or more. **[1 point]** 🔵

  > Please provide a link to the `istanbul` HTML coverage summary (or from a similar tool).

- [ ] Do you run the test on a CD/CI, such as Github Action? **[1 point]**
  > Please provide a link to the latest test summary you have, hosted on Github Action or similar.
