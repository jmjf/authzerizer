import { Entity, Column, BeforeInsert, OneToMany } from 'typeorm';
import { nanoid } from 'nanoid';

import { LibraryResourceToAuthor } from './LibraryResourceToAuthor.entity';

@Entity({ name: 'Author' })
export class Author {
	@Column({ primary: true, type: 'varchar', length: 21, name: 'AuthorId' })
	authorId: string;

	@Column({ nullable: false, name: 'AuthorName', unique: true })
	authorName: string;

	@OneToMany(() => LibraryResourceToAuthor, (lr2a) => lr2a.author, {
		cascade: true,
	})
	libraryResources: LibraryResourceToAuthor[];

	@BeforeInsert()
	setId() {
		this.authorId = nanoid();
	}
}
