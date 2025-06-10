# UpFrom App

## Structure

### Monorepo

This is a monorepo that allows us to re-use external packages across our different workspaces without having to download and store them in each of those workspaces. Additionally, the monorepo structure allows us to easily share internal packages across our different applications. For example, our frontend is able to import `@up-from/graphql/genql` from our graphql workspace. We currently have three workspaces which you can find listed in the root `package.json`: services, graphql, and frontend. A monorepo also allows us to ship together logically related changes in code that span multiple workspaces. Lastly, it allows us to easily take advantage of TS typings across workspaces.

### Frontend

As you would expect, all of our frontend code, that is, our react native code lives within the `frontend` directory. Within this folder, you will find our native specific code located in the `ios` and `android` folders. The native code, along with the `metro` bundler used by react native create a wrinkle for adding frontend packages. Metro bundler and react native do not allow symlinking native packages. Native packages are those packages we install for our front end that make changes to the native code - again, found within the ios/android folders - via linking for android or pod installs for ios. Any such packages must therefore be `nohoist`-ed to prevent them from being placed at our repo's root and made inaccessible to the react native app. **Anytime you install a frontend package that has native code, i.e. requires android linking and pod installation, you must add it to the `nohoist` array.**

### Backend

We're using a serverless backend which, among bringing other benefits, lowers our costs (we only pay for actual usage), removes server maintenance/management (especially important without dedicated dev-ops), and improves flexibility/scaleability. That being said, serverless has its own challenges and can be an especially daunting paradigm shift to serverless first-timers like yours truly.

Fortunately, SST, the serverless framework we use, has abstracted away so much of the frustrating and confusing parts of aws serverless, distilling them down into a set of best practices that keep with [Domain Driven Design](https://www.youtube.com/watch?v=MC_dS5G1jqw). In Addition to providing out of the box "constructs" that work without hassling with AWS, SST enables live reloading and debugging while remaining serverless (no mocks)! You can learn more about how this works [here](https://docs.sst.dev/live-lambda-development). This greatly improves our application's scalability and our ability to build quickly with little to no _direct_ interaction with AWS itself.

Please take your time to go carefully through the [SST learning section](https://docs.sst.dev/learn/) to get a sense of how this works. The SST team also have a [discord](https://discord.com/channels/983865673656705025/983866416832864350) where they and their users are extremely helpful in answering questions and providing guidance.

The list of secrets for your ens can be found in "./stacks/SecretsStack.ts" you can set a secret by running th command: 'yarn secret:set:"/envName/"'

## Setup

### Serverless Dev Environment

Each developer will develop "locally" in their own, isolated [stage](https://sst.dev/chapters/stages-in-serverless-framework.html) where a serverless stack is spun up just for them. This stage is like their own environment that operates within our larger developer aws account. In this way, there will be multiple dev stages - a personal one for each developer - associated with a single AWS developer account. We also have a Staging and Production AWS account, but unlike the Developer account, these only have one stage associated with each of them. You can see this SST recommended team setup described [here](https://docs.sst.dev/working-with-your-team#aws-account-per-environment).

In the future, we will probably want to have multiple stages within our AWS staging account that will spin up and tear down whenever a new pull-request/feature is introduced, enabling isolated QA environments.

1. To get started, you will first be given an AWS single sign on (SSO) user which you will log into to verify. This SSO will allow you to create your personal developer stage for local development and will give you read access to the staging and prod stages as well so that you can debug them and view their consoles.
2. Then, you'll have to install the AWS cli. I used brew to do this but you can find other ways in the [docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
3. Run `aws configure sso` following the prompts to set the start url to "https://d-9067b57b64.awsapps.com/start" and the region to "us-east-1". I called my profile "dev" but you can name it what you wish. I also set it as my default profile so I wouldn't have to specify dev each time I launch SST. Your `~/.aws/config` should look something like this:
   ![Screen Shot 2022-08-25 at 10 04 29 AM](https://user-images.githubusercontent.com/10200567/186726583-d29ee36b-3a14-4fa7-ab74-4cd03904fd1e.png)
4. Before you run your serverless SST stage, you will likely have to quickly login to your SSO account and authorize the command through the console. You will also log in from time to time, as access sessions are fairly shortlived to keep AWS resources secure. You can log in from the command line like so specifying the profile argument to whatever you named it above: `aws sso login --profile dev`.
5. You should be ready to go and can now run `yarn start` which will fire up an SST stage (assuming you've installed all packages first by running yarn). As it is your first time, it will ask for a stage name. Remember, this is your own personal environment for local development so give it your own name as the stage name that avoids collision. I called mine josh.
6. You will repeat 1-4 to activate a SSO profile for our AWS staging and prod accounts. However, unlike your dev SSO, these will only give read access.

PLEASE NOTE: You might need to update libraries and packages to the lates versions to make sure that everything is working properly. During packages update you might need to reset yarn.lock

## Release Cycle

This section is somewhat in flux as we figure out, through trial and error, what flow makes the most sense. That being said, we want to ensure continuous development where possible, building and releasing swiftly and avoiding huge, all at once, version updates. At a high level, our release level looks something like this with written details following:

<img width="2056" alt="Release Flow" src="https://user-images.githubusercontent.com/10200567/199300438-064b9c09-063d-4a02-950d-ba108214a231.png">

### Frontend

An addition to the standard process of building and distributing new versions for users to update to through the google play or ios app store, React Native allows over the air (OTA) updates through codepush. Through Code Push, we can release small changes and bug fixes immediately to user devices without them having to receive the update through their app store. This is possible when we make **JS only** changes to our frontend (no changes to the native code in the ios or android directories). Apple and Google also impose limits on how extensive OTA changes can be, so just because the changes are JS only, that doesn't necessarily mean we can ship them immediately over the air and circumvent review through the app/google play store.

We're using Github Actions for our frontend CI/CD pipeline. We can manually dispatch GH actions directly from github that release traditional android and ios releases as well as OTA updates (which release to both platforms) to staging. These non-ota releases will build the application for their platform and distribute it to our internal testers for free via firebase. The OTA releases will be shipped only to phones that have the staging build of the app.

You will need to have Apple developer account, Google play store account, and microsoft app distribution account to release app through github actions. And Firebase app distribution account for staging builds distribution.

Here is the list of variables that should be setup in github:
Environment secrets: - API_URL - CODE_PUSH_DEPLOYMENT_KEY_ANDROID - CODE_PUSH_DEPLOYMENT_KEY_IOS - GOOGLE_PLACES_API_KEY - IOS_MOBILE_PROVISION_BASE64_AD_HOC - STREAM_CHAT_API_KEY
Repository secrets: - ANDROID_ALIAS - ANDROID_FIREBASE_APP_ID - ANDROID_KEY_PASSWORD - ANDROID_KEY_STORE_PASSWORD - ANDROID_SERVICE_ACCOUNT_JSON_TEXT - ANDROID_SIGNING_KEY_BASE64 - APPCENTER_ACCESS_TOKEN - APPSTORE_API_KEY_ID - APPSTORE_API_PRIVATE_KEY - APPSTORE_API_PRIVATE_KEY_BASE64 - APPSTORE_ISSUER_ID - FIREBASE_CREDENTIAL_FILE_CONTENT - IOS_CERTIFICATE_PASSWORD - IOS_FIREBASE_APP_ID - IOS_MOBILE_PROVISION_BASE64_APP_STORE - IOS_P12_BASE64 - IOS_TEAM_ID

### Backend

For now, we're using Seed, the CI/CD for serverless [developed by SST](https://docs.sst.dev/learn/git-push-to-deploy). This even allows us to do a pr-based workflow where a new serverless stage is spun up (and torn down) for each pr/feature. We aren't able to implement this yet, however, until we can sync our frontenv variables with the backend variables dynamically generated with each pr-stage.

### Putting it all together

In keeping with github flow we should stive for simplicity, keeping only one long-lived branch (main) and everything else branching off of that. Main should always be deployable to prod and so every new feature/fix branch that gets merged back into main should be deployed right away. Before merging to main, the feature branch should've deployed the backend successfully to staging via seed, and the front-end to staging via OTA (if applicable) or traditional build and distribution. This should then be QA'ed by our testers before being merged into main and deployed to prod. These merges should use semantic versioning to release new updates to the application. This is where things get tricky, because, not only is the backend versioned differently, the frontend has two types of distributions that are possible - traditional and OTA.

To address this complexity, if the feature/fix is eligible for OTA, you should postfix the version tag with ota. For example, let's say the current app version is 3.2.5. You've been working on a small feature branch that only makes changes to the frontend javascript bundle (not the native code). The feature is eligible for an OTA update. You've released this feature via OTA to staging where it's passed QA and is now ready to be merged to main and deployed to prod. But first, you must update the version. You do this by updating the frontend package.json version to 3.3.0-ota.

When main is ready to be versioned and released to prod, navigate to the frontend folder, run `yarn version`, input the correct version and push to GH. From here, create a GH release, using the pushed version tag and fill in a meaningful description for the release version. Submit the release. GH actions will automatically release this new version to prod through the right channel; regular build and release google play console + apple app center or ota to production users' devices. With regular releases, these still need pass muster with google and apple before being pushed before making their way through alpha to the store.
