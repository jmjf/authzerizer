import dotenv from 'dotenv';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import { DemoDataSource } from './data-source';
import { Author } from './entity/Author.entity';
import { LibraryResource } from './entity/LibraryResource.entity';
import { LibraryResourceSubject } from './entity/LibraryResourceSubject.entity';
import { LibraryResourceToAuthor } from './entity/LibraryResourceToAuthor.entity';

DemoDataSource.initialize()
	.then(async () => {
		console.log('Inserting a new LR into the database...');

		const rawAuthors = [
			{ authorName: 'Joe Jones', roleTerm: 'author' },
			{ authorName: 'Tom Tomlinson', roleTerm: 'author' },
			{ authorName: 'Sue Smith', roleTerm: 'writer of foreword' },
		];

		const rawSubjects = ['Subject 4', 'Subject 3'];

		// Authors are harder because they use a custom m:m table
		// TypeORM doesn't an all-the-way-through update in this case
		// We need to upsert authors so we get ids, then use those ids to build LR2A for LR
		// let authors = rawAuthors.map((ra) => {
		// 	const a = new Author();
		// 	a.authorName = ra.authorName;
		// 	return a;
		// });
		const distinctAuthors = [
			...new Set(rawAuthors.map((ra) => ra.authorName)),
		];
		const authors = await Promise.all(
			distinctAuthors.map(async (da): Promise<Author> => {
				const au = new Author();
				au.authorName = da;
				return (
					(await DemoDataSource.manager.findOneBy(Author, {
						authorName: da,
					})) || au
				);
			})
		);
		console.log('authors', authors);
		await DemoDataSource.manager.save(Author, authors);
		// now authors has authorId values

		const libraryResource = new LibraryResource();
		libraryResource.title = 'Test resource 1';

		// Subjects are easy because the relationship isn't customized
		// TypeORM lets us put a subject[] on the LR, save the LR and get LR, LR2S and S in one call
		libraryResource.subjects = rawSubjects.map((s) => {
			const lr2s = new LibraryResourceSubject();
			lr2s.subjectText = s;
			return lr2s;
		});

		libraryResource.authors = rawAuthors.map((ra) => {
			// find the author we saved so we can get the id
			const foundAuthor = authors.find(
				(a) => a.authorName === ra.authorName
			);
			// build the LR2A
			const lr2a = new LibraryResourceToAuthor();
			lr2a.author = foundAuthor || ({} as Author);
			lr2a.libraryResource = libraryResource;
			lr2a.roleTerm = ra.roleTerm;

			return lr2a;
		});

		await DemoDataSource.manager.save(libraryResource);
		console.log('Saved a new lr with id: ' + libraryResource.resourceId);

		console.log('Reading lr from the database...');
		const lrs = await DemoDataSource.manager.find(LibraryResource, {
			relations: ['authors', 'subjects'],
		});
		console.log('Result: ', lrs);

		console.log(
			'Here you can setup and run express / fastify / any other framework.'
		);
	})
	.catch((error) => console.log(error));
