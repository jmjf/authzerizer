import {
	Entity,
	Column,
	BeforeInsert,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { nanoid } from 'nanoid';

import { LibraryResourceToAuthor } from './LibraryResourceToAuthor.entity';
import { LibraryResourceSubject } from './LibraryResourceSubject.entity';
//import { Author } from './Author.entity';

@Entity({ name: 'LibraryResource' })
export class LibraryResource {
	@BeforeInsert()
	setId() {
		this.resourceId = nanoid();
	}

	@Column({ primary: true, type: 'varchar', length: 21, name: 'ResourceId' })
	resourceId: string;

	@Column({ nullable: false, name: 'Title' })
	title: string;

	@Column({ name: 'Subtitle', nullable: true })
	subtitle: string;

	@Column({
		type: 'varchar',
		length: 30,
		name: 'LcCallNumber',
		nullable: true,
	})
	lcCallNumber: string;

	@Column({
		type: 'varchar',
		length: 30,
		name: 'DdCallNumber',
		nullable: true,
	})
	ddCallNumber: string;

	@Column({ type: 'varchar', length: 30, name: 'Isbn', nullable: true })
	isbn: string;

	@Column({ name: 'Abstract', nullable: true })
	abstract: string;

	@Column({
		type: 'varchar',
		length: 100,
		name: 'PublisherName',
		nullable: true,
	})
	publisherName: string;

	@Column({
		type: 'varchar',
		length: 30,
		name: 'PublishedDate',
		nullable: true,
	})
	publishedDate: string;

	@OneToMany(() => LibraryResourceToAuthor, (lr2a) => lr2a.libraryResource, {
		cascade: true,
	})
	authors: LibraryResourceToAuthor[];

	@ManyToMany(() => LibraryResourceSubject, {
		cascade: true,
	})
	@JoinTable({ name: 'LibraryResourceToSubject' })
	subjects: LibraryResourceSubject[];
}
