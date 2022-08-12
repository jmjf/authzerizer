import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const DemoDataSource = new DataSource({
	type: 'postgres',
	host: process.env.TYPEORM_HOST,
	port: parseInt(process.env.TYPEORM_PORT || '1'),
	username: process.env.TYPEORM_USERNAME,
	password: process.env.TYPEORM_PASSWORD,
	database: process.env.TYPEORM_DATABASE,
	synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
	logging: process.env.TYPEORM_LOGGING === 'true',
	entities: ['src/entity/*.entity.ts'],
	migrations: [],
	subscribers: [],
});
