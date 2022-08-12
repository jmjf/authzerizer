import dotenv from 'dotenv';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import express from 'express';

import { DemoDataSource } from './data-source';
import { LibraryResource } from './entity/LibraryResource.entity';
// import { Author } from './entity/Author.entity';

DemoDataSource.initialize().then(async () => {
	const app = express();
	const dataManager = DemoDataSource.manager;
	const resourceUrl = '/api/resources';

	app.get(resourceUrl, async (req: express.Request, res: express.Response) => {
		console.log('Request', req.route.path, req.route.method);
		const data = await dataManager.find(LibraryResource, {
			relations: ['authors'],
		});
		res.send(data);
	});

	app.listen(process.env.EXPRESS_PORT, () => {
		console.log('API started');
	});
});
