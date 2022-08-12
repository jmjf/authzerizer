import dotenv from 'dotenv';

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
			const distinctAuthors = [...new Set(resource.authors)];
			const authors = await Promise.all(
				distinctAuthors.map(async (da): Promise<Author> => {
					const au = new Author();
					au.authorName = da.authorName;
					au.roleName = da.roleTerm;
					return (
						(await DemoDataSource.manager.findOneBy(Author, {
							authorName: da.authorName,
							roleName: da.roleTerm,
						})) || au
					);
				})
			);

			const libraryResource = new LibraryResource();
			libraryResource.title = resource.title;
			libraryResource.subtitle = resource.subtitle;
			libraryResource.abstract = resource.abstract;
			libraryResource.ddCallNumber = resource.ddCallNumber;
			libraryResource.isbn = resource.isbn;
			libraryResource.lcCallNumber = resource.lcCallNumber;
			libraryResource.publishedDate = resource.publishedDate;
			libraryResource.publisherName = resource.publisherName;
			libraryResource.authors = authors;

			await DemoDataSource.manager.save(libraryResource);
			console.log('Saved a new lr with id: ' + libraryResource.resourceId);
		}
	})
	.catch((error) => console.log(error));
