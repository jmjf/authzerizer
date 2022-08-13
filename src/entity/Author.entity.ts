import { Entity, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity({ name: 'Author' })
export class Author {
	@BeforeInsert()
	setId() {
		this.authorId = nanoid();
	}

	@Column({ primary: true, type: 'varchar', length: 21, name: 'AuthorId' })
	authorId: string;

	@Column({ type: 'varchar', length: 100, name: 'AuthorName' })
	authorName: string;

	@Column({ type: 'varchar', length: 100, name: 'RoleName', nullable: true })
	roleName: string;
}
