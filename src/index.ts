import dotenv from 'dotenv';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import express from 'express';
import { buildLR } from './buildLR';

import { DemoDataSource } from './data-source';
import { LibraryResource } from './entity/LibraryResource.entity';
// import { Author } from './entity/Author.entity';

DemoDataSource.initialize().then(async () => {
	const app = express();
	const dataManager = DemoDataSource.manager;
	const resourceUrl = '/api/resources';

	app.use(express.json());

	app.get(resourceUrl, async (req: express.Request, res: express.Response) => {
		console.log('Request', req.route.method, req.url);
		const data = await dataManager.find(LibraryResource, {
			relations: ['authors'],
		});
		res.status(200).send(data);
	});

	app.get(
		`${resourceUrl}/:resourceId`,
		async (req: express.Request, res: express.Response) => {
			console.log(
				`Request`,
				req.route.method,
				req.url,
				req.params.resourceId
			);

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
			console.log(
				'Request',
				req.route.method,
				req.url,
				JSON.stringify(req.body, null, 3)
			);

			const libraryResource = await buildLR(req.body, dataManager);
			await DemoDataSource.manager.save(libraryResource);
			console.log('Saved resource id: ' + libraryResource.resourceId);
			res.status(201).send(libraryResource);
		}
	);

	app.listen(process.env.EXPRESS_PORT, () => {
		console.log('API started');
	});
});
