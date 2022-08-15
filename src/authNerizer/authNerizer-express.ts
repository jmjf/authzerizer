import type { Agent } from 'https';
import type { Request, Response, NextFunction } from 'express';

import buildGetJwks from 'get-jwks';
import { createVerifier, Algorithm } from 'fast-jwt';

// from get-jwks, not exported so define it
export type GetPublicKeyOptions = {
	domain?: string;
	alg?: string;
	kid?: string;
};

// from get-jwks, not exported so define it
export type GetJwksOptions = {
	max?: number;
	ttl?: number;
	allowedDomains?: string[];
	providerDiscovery?: boolean;
	jwksPath?: string;
	agent?: Agent;
};

// from fast-jwks, exports the interface, but members not optional
export interface VerifierOptions {
	algorithms?: Algorithm[];
	complete?: boolean;
	cache?: boolean | number;
	cacheTTL?: number;
	allowedJti?: string | RegExp | Array<string | RegExp>;
	allowedAud?: string | RegExp | Array<string | RegExp>;
	allowedIss?: string | RegExp | Array<string | RegExp>;
	allowedSub?: string | RegExp | Array<string | RegExp>;
	allowedNonce?: string | RegExp | Array<string | RegExp>;
	ignoreExpiration?: boolean;
	ignoreNotBefore?: boolean;
	maxAge?: number;
	clockTimestamp?: number;
	clockTolerance?: number;
	requiredClaims?: Array<string>;
	checkTyp?: string;
}

export type AuthNerizerOptions = {
	requireValidToken?: boolean;
	publicKey?: string | Buffer;
	getPublicKeyOptions?: GetPublicKeyOptions;
	getJwksOptions?: GetJwksOptions;
	verifierOptions?: VerifierOptions;
};

export type JwtPayload = {
	iss?: string;
	sub?: string;
	aud?: string;
	iat?: number;
	nbf?: number;
	exp?: number;
	azp?: string;
	gty?: string;
	jti?: string;
};

export interface RequestWithJwtPayload extends Request {
	jwtPayload?: JwtPayload;
}

export class ErrorWithStatus extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = Error.name;
		this.statusCode = statusCode;
	}
}

export async function buildAuthNerizer(opts: AuthNerizerOptions = {}) {
	// setup and configure
	// buildGetJwks uses defaults for any values not provided

	let publicKey: string | Buffer;
	let getJwks;
	if (opts.publicKey) {
		publicKey = opts.publicKey;
	} else if (opts.getJwksOptions && opts.getPublicKeyOptions) {
		getJwks = buildGetJwks(opts.getJwksOptions);

		publicKey = await getJwks.getPublicKey({
			kid: opts.getPublicKeyOptions.kid,
			domain: opts.getPublicKeyOptions.domain,
			alg: opts.getPublicKeyOptions.alg,
		});
	} else {
		throw new Error(
			'Authnerizer requires publicKey or (getJwksOptions and getPublicKeyOptions)'
		);
	}

	const verify = createVerifier({
		key: publicKey,
		...opts.verifierOptions,
	});

	const requireValidToken =
		typeof opts.requireValidToken === 'boolean'
			? opts.requireValidToken
			: true;

	// the actual middleware
	return function (
		req: RequestWithJwtPayload,
		res: Response,
		next: NextFunction
	) {
		function getPayloadOrUndefined(token: string) {
			// verify throws if it can't verify, catch it and return undefined
			try {
				return verify(token);
			} catch (err) {
				// TODO: report err, how can we get a logger without being sure what logger we're dealing with?
				return undefined;
			}
		}

		// Get authorization header
		const authHeader = req.get('Authorization');

		if (authHeader) {
			// get the token
			const [authType, token] = authHeader.split(' ');

			if (authType && authType.toLowerCase() === 'bearer' && token) {
				// token is a bearer token so we can use it
				const jwtPayload = getPayloadOrUndefined(token);

				if (typeof jwtPayload === 'object') {
					req.jwtPayload = jwtPayload;
					return next();
				}
			}
		}

		// One of the following is true
		// no auth header; not a bearer token; payload fails verification; payload isn't an object
		if (requireValidToken) {
			// authn required, but token isn't usable
			req.jwtPayload = undefined;
			return next(new ErrorWithStatus(401, 'Unauthorized'));
		} else {
			req.jwtPayload = undefined;
			return next();
		}
	};
}
