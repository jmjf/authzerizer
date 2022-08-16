import { Entity, Column } from 'typeorm';

@Entity({ name: 'ClientScope' })
export class ClientScope {
	@Column({ primary: true, type: 'varchar', length: 100, name: 'ClientId' })
	clientId: string;

	@Column({ type: 'varchar', length: 1000, name: 'Scope' })
	scope: string;
}
