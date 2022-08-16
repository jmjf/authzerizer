import { NextFunction, Response } from 'express';
import { RequestWithJwtPayload } from '../authNerizer/authNerizer-express';
import { AzrCache } from './AzrCache';

export interface AzrData {
	clientId: string;
	scope: string;
}

export class AuthZerizer extends AzrCache {
	constructor(data: AzrData[]) {
		if (!data || !Array.isArray(data) || data.length === 0)
			throw new Error('AuthZerizer constructor: missing data');

		if (
			data[0] &&
			(!data[0].hasOwnProperty('clientId') ||
				!data[0].hasOwnProperty('scope'))
		)
			throw new Error('AuthZerizer constructor: missing clientId or scope');

		if (
			data[0] &&
			(typeof data[0].clientId !== 'string' ||
				typeof data[0].scope !== 'string')
		)
			throw new Error(
				'AuthZerizer constructor: clientId or scope not string'
			);

		super();
		this.loadCache(data);
	}

	public loadCache(data: AzrData[]) {
		for (const item of data) {
			this.set(item.clientId, item.scope.split(' '));
		}
	}

	public middleware(
		req: RequestWithJwtPayload,
		res: Response,
		next: NextFunction
	) {
		return next();
	}
}
