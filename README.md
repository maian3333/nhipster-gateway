# gateway

This application was generated using JHipster 8.10.0, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v8.10.0](https://www.jhipster.tech/documentation-archive/v8.10.0).

This application was generated using the [NodeJS blueprint](https://github.com/jhipster/generator-jhipster-nodejs) of JHipster 8.10.0, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v8.10.0](https://www.jhipster.tech/documentation-archive/v8.10.0). For any questions you can refer to the stream lead: [Angelo Manganiello](https://github.com/amanganiello90).

This is a "gateway" application intended to be part of a microservice architecture, please refer to the [Doing microservices with JHipster][] page of the documentation for more information.
This application is configured for Service Discovery and Configuration with Consul. On launch, it will refuse to start if it is not able to connect to Consul at [http://localhost:8500](http://localhost:8500). For more information, read our documentation on [Service Discovery and Configuration with Consul][].

## Project Structure

Node is required for generation and recommended for development. `package.json` is always generated for a better development experience with prettier, commit hooks, scripts and so on.

In the project root, JHipster generates configuration files for tools like git, prettier, husky, and others that are well known and you can find references in the web.

- `.yo-rc.json` - Yeoman configuration file
  JHipster configuration is stored in this file at `generator-jhipster` key. You may find `generator-jhipster-*` for specific blueprints configuration.
- `.yo-resolve` (optional) - Yeoman conflict resolver
  Allows to use a specific action when conflicts are found skipping prompts for files that matches a pattern. Each line should match `[pattern] [action]` with pattern been a [Minimatch](https://github.com/isaacs/minimatch#minimatch) pattern and action been one of skip (default if ommited) or force. Lines starting with `#` are considered comments and are ignored.
- `.jhipster/*.json` - JHipster entity configuration files
- `/docker/` - Docker configurations for the application and services that the application depends on
- `/client/` - Web application.
- `/server/` - NodeJS server application.

## Development

### OAuth 2.0 / OpenID Connect

Congratulations! You've selected an excellent way to secure your NHipster application. If you're not sure what OAuth and OpenID Connect (OIDC) are, please see [What the Heck is OAuth?](https://developer.okta.com/blog/2017/06/21/what-the-heck-is-oauth)

To log in to your app, you'll need to have [Keycloak](https://keycloak.org) up and running. The JHipster Team has created a Docker container for you that has the default users and roles. Start Keycloak using the following command.

```
docker compose -f src/main/docker/keycloak.yml up
```

### Okta

If you'd like to use Okta instead of Keycloak, it's pretty quick using the [Okta CLI](https://cli.okta.com/). After you've installed it, run:

```shell
okta register
```

Then, in your JHipster app's directory, run `okta apps create` and select **JHipster**. This will set up an Okta app for you, create `ROLE_ADMIN` and `ROLE_USER` groups, create a `.okta.env` file with your Okta settings, and configure a `groups` claim in your ID token.

Run `source .okta.env` and start your app with Maven or Gradle. You should be able to sign in with the credentials you registered with.

If you're on Windows, you should install [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) so the `source` command will work.

If you'd like to configure things manually through the Okta developer console, see the instructions below.

First, you'll need to create a free developer account at <https://developer.okta.com/signup/>. After doing so, you'll get your own Okta domain, that has a name like `https://dev-123456.okta.com`.

Modify `server//src/config/application.yml` to use your Okta settings.

```yaml
  ...
  security:
    oauth2:
      client:
        provider:
          oidc:
            issuer-uri: https://{yourOktaDomain}/oauth2/default
        registration:
          oidc:
            client-id: {clientId}
            client-secret: {clientSecret}
```

Create an OIDC App in Okta to get a `{clientId}` and `{clientSecret}`. To do this, log in to your Okta Developer account and navigate to **Applications** > **Add Application**. Click **Web** and click the **Next** button. Give the app a name you’ll remember, specify `http://localhost:8080` as a Base URI, and `http://localhost:8080/login/oauth2/code/oidc` as a Login Redirect URI. Click **Done**, then Edit and add `http://localhost:8080` as a Logout redirect URI. Copy and paste the client ID and secret into your `application.yml` file.

Create a `ROLE_ADMIN` and `ROLE_USER` group and add users into them. Modify e2e tests to use this account when running integration tests. You'll need to change credentials in `client/test/e2e/account/account.spec.ts` and `client/test/e2e/admin/administration.spec.ts`.

Navigate to **API** > **Authorization Servers**, click the **Authorization Servers** tab and edit the default one. Click the **Claims** tab and **Add Claim**. Name it "groups", and include it in the ID Token. Set the value type to "Groups" and set the filter to be a Regex of `.*`.

After making these changes, you should be good to go! If you have any issues, please post them to [Stack Overflow](https://stackoverflow.com/questions/tagged/jhipster). Make sure to tag your question with "jhipster" and "okta".

### Using NestJS CLI

You can also use [NestJS CLI][] to generate some custom server code.

For example, the following command:

    nest generate module my-module

will generate the file:

    create server//src/my-component/my-component.module.ts

### Building and running

#### Running

```bash
npm run start:app
```

#### Building

```bash
npm run build:app
```

The build folder with all compiled sources will be **server//dist**.

> For more explanation about full stack server/client build refer to [server//README.md](server//README.md)
> Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js](https://nodejs.org/): Node is used to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

```
npm install
```

We use npm scripts and [Angular CLI][] with [Webpack][] as our build system.

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

```
./mvnw
npm start
```

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all the scripts available to run for this project.

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's turned off by default. One of the main components of a PWA is a service worker.

The service worker initialization code is disabled by default. To enable it, uncomment the following code in `client/src/app/app.config.ts`:

```typescript
ServiceWorkerModule.register('ngsw-worker.js', { enabled: false }),
```

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

```
npm install --save --save-exact leaflet
```

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

```
npm install --save-dev --save-exact @types/leaflet
```

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Edit [client/src/app/app.config.ts](client/src/app/app.config.ts) file:

```
import 'leaflet/dist/leaflet.js';
```

Edit [client/src/content/scss/vendor.scss](client/src/content/scss/vendor.scss) file:

```
@import 'leaflet/dist/leaflet.css';
```

Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

### Using Angular CLI

You can also use [Angular CLI][] to generate some custom client code.

For example, the following command:

```
ng generate component my-component
```

will generate few files:

```
create client/src/app/my-component/my-component.component.html
create client/src/app/my-component/my-component.component.ts
update client/src/app/app.config.ts
```

## Building for production

## Testing

### Client tests

Unit tests are run by [Jest][]. They're located near components and can be run with:

```
npm test
```

## Others

### Code quality using Sonar

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker compose -f src/main/docker/sonar.yml up -d
```

Note: we have turned off forced authentication redirect for UI in [src/main/docker/sonar.yml](src/main/docker/sonar.yml) for out of the box experience while trying out SonarQube, for real use cases turn it back on.

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner).
Then, run a Sonar analysis in the server/ folder:

```sh
npm run sonar:scanner
```

For more information, refer to the [Code quality page][].

[JHipster Homepage and latest documentation]: https://www.jhipster.tech
[JHipster 8.10.0 archive]: https://www.jhipster.tech/documentation-archive/v8.10.0
[Doing microservices with JHipster]: https://www.jhipster.tech/documentation-archive/v8.10.0/microservices-architecture/
[Using JHipster in development]: https://www.jhipster.tech/documentation-archive/v8.10.0/development/
[Service Discovery and Configuration with Consul]: https://www.jhipster.tech/documentation-archive/v8.10.0/microservices-architecture/#consul
[Using Docker and Docker-Compose]: https://www.jhipster.tech/documentation-archive/v8.10.0/docker-compose
[Using JHipster in production]: https://www.jhipster.tech/documentation-archive/v8.10.0/production/
[Running tests page]: https://www.jhipster.tech/documentation-archive/v8.10.0/running-tests/
[Code quality page]: https://www.jhipster.tech/documentation-archive/v8.10.0/code-quality/
[Setting up Continuous Integration]: https://www.jhipster.tech/documentation-archive/v8.10.0/setting-up-ci/
[Node.js]: https://nodejs.org/
[NPM]: https://www.npmjs.com/
[Node.js]: https://nodejs.org/
[Webpack]: https://webpack.github.io/
[Jest]: https://facebook.github.io/jest/
[NestJS]: https://nestjs.com/
[NestJS CLI]: https://docs.nestjs.com/cli/usages
[Webpack]: https://webpack.github.io/
[BrowserSync]: https://www.browsersync.io/
[Jest]: https://jestjs.io
[Leaflet]: https://leafletjs.com/
[DefinitelyTyped]: https://definitelytyped.org/
[Angular CLI]: https://cli.angular.io/
