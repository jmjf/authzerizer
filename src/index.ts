import dotenv from 'dotenv';

if (!process.env.APP_ENV) {
	console.log('APP_ENV is not set');
	process.exit(1);
}
dotenv.config({ path: `./env/${process.env.APP_ENV}.env` });

import { DemoDataSource } from './data-source';
import { User } from './entity/User.entity';

DemoDataSource.initialize()
	.then(async () => {
		console.log('Inserting a new user into the database...');
		const user = new User();
		user.firstName = 'Timber';
		user.lastName = 'Saw';
		user.age = 25;
		await DemoDataSource.manager.save(user);
		console.log('Saved a new user with id: ' + user.id);

		console.log('Loading users from the database...');
		const users = await DemoDataSource.manager.find(User);
		console.log('Loaded users: ', users);

		console.log(
			'Here you can setup and run express / fastify / any other framework.'
		);
	})
	.catch((error) => console.log(error));
