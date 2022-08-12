import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { Author } from './Author.entity';
import { LibraryResource } from './LibraryResource.entity';

@Entity({ name: 'LibraryResourceToAuthor' })
export class LibraryResourceToAuthor {
	@Column({ primary: true, type: 'varchar', length: 21, name: 'ResourceId' })
	resourceId!: string;

	@Column({ primary: true, type: 'varchar', length: 21, name: 'AuthorId' })
	authorId!: string;

	@ManyToOne(() => LibraryResource, (lr) => lr.authors, { nullable: false })
	@JoinColumn({ name: 'ResourceId' })
	libraryResource!: LibraryResource;

	@ManyToOne(() => Author, (author) => author.libraryResources)
	@JoinColumn({ name: 'AuthorId' })
	author!: Author;

	@Column({ primary: true, type: 'varchar', length: 30, name: 'RoleTerm' })
	roleTerm!: string;
}
