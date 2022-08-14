import type { Agent } from 'https';
import type { Request, Response, NextFunction } from 'express';

import buildGetJwks from 'get-jwks';
import { createVerifier, VerifierOptions } from 'fast-jwt';

// from get-jwks
type GetPublicKeyOptions = {
	domain?: string;
	alg?: string;
	kid?: string;
};

// from get-jwks
type GetJwksOptions = {
	max?: number;
	ttl?: number;
	allowedDomains?: string[];
	providerDiscovery?: boolean;
	jwksPath?: string;
	agent?: Agent;
};

interface AuthNerizerOptions {
	authnRequired?: boolean;
	publicKey?: string | Buffer;
	getPublicKeyOptions?: GetPublicKeyOptions;
	getJwksOptions?: GetJwksOptions;
	verifierOptions?: VerifierOptions;
}

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

interface AuthNerizerRequest extends Request {
	jwtPayload?: AuthNerizerJwtPayload;
}

class AuthnerizerError extends Error {
	statusCode: number;

	constructor(statusCode: number, message: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = Error.name;
		this.statusCode = statusCode;
	}
}

async function buildAuthNerizer(opts: AuthNerizerOptions) {
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

	const authnRequired = opts.authnRequired || true;

	// the actual middleware
	return function (
		req: AuthNerizerRequest,
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
		const authHeader = req.header('Authorization');

		if (authHeader) {
			// get the token
			const [authType, token] = authHeader.split(' ');

			if (authType && authType.toLowerCase() === 'bearer' && token) {
				// token is a bearer token so we can use it
				const jwtPayload = getPayloadOrUndefined(token);

				if (typeof jwtPayload === 'object') {
					req.jwtPayload = jwtPayload;
					next();
					return; // probably not required, but make intent clear
				}
			}
		}

		// One of the following is true
		// no auth header; not a bearer token; payload fails verification; payload isn't an object
		if (authnRequired) {
			// authn required, but token isn't usable
			next(new AuthnerizerError(401, 'Unauthorized'));
			return; // probably not required, but make intent clear
		}

		next();
	};
}

export {
	AuthNerizerOptions,
	AuthNerizerRequest,
	AuthNerizerJwtPayload,
	GetPublicKeyOptions,
	GetJwksOptions,
	VerifierOptions,
	buildAuthNerizer,
};
