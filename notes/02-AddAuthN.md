# Add authentication to the API

I want the API to authenticate users with OAuth2 bearer tokens so I know the identity of the caller.

Authzerizer is for cases where the OAuth provider doesn't support authorization--meaning, no scopes. It will need to know the client id of the caller so it can look it up in the list of authorized ids and scopes it maintains. So, let's get AuthN in place.

## Plan for infrastructure differences

I've built the demo api with Express and TypeORM. I want to be sure Authzerizer can deal with alternate choices. I want to get the Express/TypeORM option running first. For now, I've renamed `index.ts` to `index-exto.ts` (Express/TypeORM) and renamed the `start:dev` script to `start:dev:exto`. When I get ready to support other options (Prisma, Fastify, etc.), I'll build a better directory structure. This is good enough for now.

## Set up OAuth provider credentials

I'm using Auth0 for testing

-  Set up an API (authzerizer-demo-api) and get credentials for it so it can authenticate callers
   -  Set token expiration to 900 seconds (15 minutes) for easier token expiration testing later
-  Set up two applications (authzerizer-client-1 and 2) so I can use them to test calling the API
   -  Added "get token" items in Insomnia for each

## Add AuthN to the API

I'm going to roll my own AuthN.

-  Install `fast-jwt` and `get-jwks`

Build a middleware that will setup

-  Get JWKS public key
-  Create a verifier
-  For every request do the AuthN process below

Basic AuthN process

-  Get the authorization header; split on space; [0] s/b Bearer, [1] is the token
   -  If not Bearer or no Authorization header respond 401
-  Use JWT verifier to decode the token; get the token body; requires calling the provider for the key
-  If the token is not okay respond 401
   -  Introspect returns nothing; JWT doesn't decode
   -  Token is not active or is expired (exp) or not valid (nbf, iat)
   -  Token is not for the right audience (aud)
-  Store token body in the request.user or similar

Writing middleware in Express

```javascript
// my-middleware
export default function (options) {
	// Setup here
	return function (req, res, next) {
		// Implement the middleware function based on the options object
		next();
	};
}

// use it
import mw from './my-middleware';

app.use(mw({ option1: '1', option2: '2' }));
```

In my case, the exported function does the setup and returns the function that does the AuthN process

### AuthNerizer documentation (briefly)

AuthNerizer is Express middleware that performs basic authentication (Auth**N**) on a JWT token.

It uses Nearform's [fast-jwt](https://github.com/nearform/fast-jwt) to decode and verify JWT tokens and optionally [get-jwks](https://github.com/nearform/get-jwks) to get a public key by JWKS.

AuthNerizer is written in TypeScript and exports interfaces defining the data structures it uses.

```typescript
export {
	AuthNerizerOptions,
	AuthNerizerRequest,
	AuthNerizerJwtPayload,
	GetPublicKeyOptions,
	GetJwksOptions,
	VerifierOptions,
	buildAuthNerizer,
};
```

```typescript
import { buildAuthNerizer } from 'authNerizer-express';

const authNerizer = buildAuthNerizer({ publicKey: 'your-public-key-pem'});
// OR
const authNerizer = buildAuthNerizer({ getJwksOptions: {...}, getPublicKeyOptions: {...} });

app.use(authNerizer);
```

AuthNerizer takes options as defined in the `AuthNerizerOptions` interface.

```typescript
interface AuthNerizerOptions {
	requireValidToken?: boolean;
	/**
	 * Optional
	 *
	 * Default: true
	 *
	 * If true, pass on an error (statusCode=401; Unauthorized) any request that does not include an valid Bearer token
	 * "pass on an error" means it calls next(new ErrorWithStatusCode(401, 'Unauthorized')) so later error handling middleware can process it
	 *
	 * If false, do not error requests that do not include a valid Bearer token
	 *
	 * In both cases:
	 * 	If the token is valid, req.jwtPayload contains the token's payload
	 * 	If the token is invalid, req.jwtPayload exists, but is undefined
	 */

	/**
	 * NOTE: YOU MUST PROVIDE EITHER
	 * 	publicKey
	 * 		OR
	 * 	getJwksOptions AND getPublicKeyOptions (one-time JWKS)
	 *
	 * publicKey takes priority over JWKS
	 *
	 * Configuration will throw an error if this requirement is not met.
	 */

	publicKey?: string | Buffer;
	/**
	 * Optional
	 *
	 * Default: undefined
	 *
	 * The public key to use to decrypt tokens in PEM format
	 *
	 * Provide either publicKey or (getJwksOptions and getPublicKeyOptions); publicKey takes priority
	 */

	getJwksOptions?: {
		max?: number;
		ttl?: number;
		allowedDomains?: string[];
		providerDiscovery?: boolean;
		jwksPath?: string;
		agent?: Agent; // from https
	};
	/**
	 * Optional
	 *
	 * Default: See https://github.com/nearform/get-jwks
	 *
	 * Options passed to get-jwks buildGetJwks() method
	 *
	 * Provide either publicKey or (getJwksOptions and getPublicKeyOptions); publicKey takes priority
	 *
	 * interface GetJwksOptions
	 */

	getPublicKeyOptions?: {
		kid?: string;
		alg?: 'RS256' | 'HS256';
		domain?: string;
	};
	/**
	 * Optional
	 *
	 * Default: See https://github.com/nearform/get-jwks
	 *
	 * Options passed to get-jwks getPublicKey() method
	 *
	 * Provide either publicKey or (getJwksOptions and getPublicKeyOptions); publicKey takes priority
	 *
	 * interface GetPublicKeyOptions
	 */

	verifierOptions?: VerifierOptions;
	/**
	 * Optional
	 *
	 * Default: see https://github.com/nearform/fast-jwt
	 *
	 * Options passed to fast-jwt createVerifier() method
	 *
	 * interface VerifierOptions
	 *
	 * *** NOTE ***
	 * verifierOptions.requiredClaims: string[] is a list of claims that must be present on the token to pass verification.
	 * For example, given { requiredClaims: ['sub', 'iss', 'aud'] } a token without sub || iss || aud will fail verification.
	 *
	 * This option is useful if you require certain claims to authorize the token or meet your organization's information
	 * security standards. It will reject requests with missing claims at the authenticate step, saving compute cycles
	 * and reducing risk.
	 *
	 */
}
```

AuthNerizer also provides:

-  `interface RequestWithJwtPayload extends express.Request` adding `jwtPayload: JwtPayload`
-  `interface JwtPayload` with common JWT claims
-  `class ErrorWithStatus extends Error` adding `statusCodeValue: number`

```typescript
interface AuthNerizerJwtPayload {
	iss?: string;
	sub?: string;
	aud?: string;
	iat?: number;
	nbf?: number;
	exp?: number;
	azp?: string;
	gty?: string;
	jti?: string;
}
```

**COMMIT: FEAT: (untested) build Express middleware to authenticate (AuthN) a JWT token**

## Write tests for it

-  Add `jest.config.js` to support TypeScript
-  Turn off TS option that disallows unused params (because res isn't used but is required)
-  Research on middleware error handling
   -  `return next(err);`
   -  makes the error available to any error handling middleware downstream
   -  default Express error handler will respond with an error using status code from the error or 400

Tests for buildAuthNerizer
- [x] When no options for publicKey or JWKS, it throws an error
- [x] When no public key and only one option for JWKS, it throws an error
- [x] When options are good, it returns a function

Tests for middleware returned

authnRequired false

- [x] When it gets a request without an Authorization header, it passes the request; jwtPayload undefined
- [x] When it gets a request without Bearer, it passes the request; jwtPayload undefined
- [x] When it gets a bad token, it passes the request; jwtPayload undefined
- [x] When it gets a good token, it passes the request; jwtPayload undefined

authnRequired true

- [x] When it gets no Authorization header, it errors 401; jwtToken undefined
- [x] When it gets an authorization type that isn't Bearer, it errors 401; jwtToken undefined
- [x] When it gets an invalid token, it errors 401; jwtPaylod undefined
- [x] When it gets a valid token, it passes the request; jwtPaylod contains the token

**CODE: TEST: add unit tests for AuthNerizer**

## Add to the API

-  Add AuthNerizer to the API with a somewhat restrictive configuration
-  Add a simple jwt payload logger middleware to show JWTs (on success)
-  Add a simple error logger middleware to see errors and reject the request (because default errors are verbose)

HTTP call tests

- [x] No Authorization header -> unauthorized
- [x] Not Bearer -> unauthorized
- [x] Invalid token (expired) -> unauthorized
- [x] Valid token -> returns data

Plus more, but all show it works.

**CODE: FEAT: add AuthNerizer to the API; plus JWT logger, error logger/rejecter**
