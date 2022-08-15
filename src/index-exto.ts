import dotenv from 'dotenv';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import express from 'express';

import {
	buildAuthNerizer,
	ErrorWithStatus,
	RequestWithJwtPayload,
} from './authNerizer/authNerizer-express';

import { buildLR } from './buildLR';
import { DemoDataSource } from './data-source';
import { LibraryResource } from './entity/LibraryResource.entity';
// import { Author } from './entity/Author.entity';

DemoDataSource.initialize().then(async () => {
	const app = express();
	const dataManager = DemoDataSource.manager;
	const resourceUrl = '/api/resources';

	const authIssuer = process.env.AUTH_ISSUER || undefined;
	const authDomain = process.env.AUTH_DOMAIN || undefined;
	const authAudience = process.env.AUTH_AUDIENCE || undefined;

	const authNerizer = await buildAuthNerizer({
		getJwksOptions: {
			allowedDomains: authDomain ? [authDomain] : undefined,
		},
		getPublicKeyOptions: {
			kid: process.env.AUTH_JWKS_KID,
			domain: authIssuer,
			alg: 'RS256',
		},
		verifierOptions: {
			algorithms: ['RS256'],
			allowedAud: authAudience ? [authAudience] : undefined,
			allowedIss: authIssuer ? [authIssuer] : undefined,
			// tokens without exp pass verification, so require it
			requiredClaims: ['sub', 'aud', 'iss', 'exp'],
		},
	});

	const jwtPayloadLogger = (
		req: RequestWithJwtPayload,
		res: express.Response,
		next: express.NextFunction
	) => {
		if (req.jwtPayload) {
			console.log('JWT', req.jwtPayload);
		}
		return next();
	};

	const errorHandler = (
		error: ErrorWithStatus,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.log(
			'ERROR',
			error.statusCode,
			error.message,
			req.get('Authorization')
		);
		res.sendStatus(error.statusCode || 400);
	};

	app.set('x-powered-by', false);
	app.use(express.json());
	app.use(authNerizer);
	app.use(jwtPayloadLogger);
	app.use(errorHandler);

	app.get(
		resourceUrl,
		async (req: RequestWithJwtPayload, res: express.Response) => {
			const data = await dataManager.find(LibraryResource, {
				relations: ['authors'],
			});
			res.status(200).send(data);
		}
	);

	app.get(
		`${resourceUrl}/:resourceId`,
		async (req: RequestWithJwtPayload, res: express.Response) => {
			const data = await dataManager.find(LibraryResource, {
				where: { resourceId: req.params.resourceId },
				relations: ['authors'],
			});
			res.status(200).send(data);
		}
	);

	app.post(
		resourceUrl,
		async (req: express.Request, res: express.Response) => {
			const libraryResource = await buildLR(req.body, dataManager);
			await DemoDataSource.manager.save(libraryResource);
			console.log('Saved resource id: ' + libraryResource.resourceId);
			res.status(201).send(libraryResource);
		}
	);

	app.put(
		`${resourceUrl}/:resourceId`,
		async (req: express.Request, res: express.Response) => {
			if (!req.params.resourceId || req.params.resourceId.length !== 21)
				res.send(400);

			// ensure the id is on the resource we pass
			const resource = { ...req.body, resourceId: req.params.resourceId };

			const libraryResource = await buildLR(resource, dataManager);
			libraryResource.resourceId =
				req.params.resourceId || libraryResource.resourceId;
			await DemoDataSource.manager.save(libraryResource);
			console.log('Saved resource id: ' + libraryResource.resourceId);
			res.status(201).send(libraryResource);
		}
	);

	app.listen(process.env.EXPRESS_PORT, () => {
		console.log('API started');
	});
});
