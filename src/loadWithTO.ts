import dotenv from 'dotenv';
import { buildLR } from './buildLR';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import { DemoDataSource } from './data-source';
import { Author } from './entity/Author.entity';
import { LibraryResource } from './entity/LibraryResource.entity';
import { resources } from './testData';

DemoDataSource.initialize()
	.then(async () => {
		for (const resource of resources) {
			// ensure we have no dupes
			const libraryResource = await buildLR(
				resource,
				DemoDataSource.manager
			);

			await DemoDataSource.manager.save(libraryResource);
			console.log('Saved resource id: ' + libraryResource.resourceId);
		}
	})
	.catch((error) => console.log(error));
