import { Entity, Column, BeforeInsert } from 'typeorm';
import { nanoid } from 'nanoid';

@Entity({ name: 'LibraryResourceSubject' })
export class LibraryResourceSubject {
	@BeforeInsert()
	setId() {
		this.subjectId = nanoid();
	}

	@Column({ primary: true, type: 'varchar', length: 21, name: 'SubjectId' })
	subjectId: string;

	@Column({ nullable: false, name: 'SubjectText', unique: true })
	subjectText: string;
}
