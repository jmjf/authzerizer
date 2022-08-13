import type { EntityManager } from 'typeorm';
import { Author } from './entity/Author.entity';
import { LibraryResource } from './entity/LibraryResource.entity';

export async function buildLR(resource: any, dataManager: EntityManager) {
	console.log('resource', resource);

	const distinctAuthors = [...new Set(resource.authors)] as {
		authorName: string;
		roleTerm: string;
	}[];
	const authors = await Promise.all(
		distinctAuthors.map(async (da): Promise<Author> => {
			const au = new Author();
			au.authorName = da.authorName;
			au.roleName = da.roleTerm;
			return (
				(await dataManager.findOneBy(Author, {
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
	return libraryResource;
}
