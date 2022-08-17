import { NextFunction, Response } from 'express';
import {
	ErrorWithStatus,
	RequestWithJwtPayload,
} from '../authNerizer/authNerizer-express';
import { AzrCache } from './AzrCache';

export interface AzrData {
	clientId: string;
	scope: string;
}

export interface AzrOpts {
	size?: number;
	data?: AzrData[];
	requireAuthZ?: boolean; // if true, reject requests where client id is not found
}

export interface RequestWithJwtScopes extends RequestWithJwtPayload {
	azrScopes: string[];
}

export class AuthZerizer {
	private _cache: AzrCache;
	private _requireAuthZ: boolean;

	constructor(opts: AzrOpts) {
		const size = opts.size || 1000;
		this._cache = new AzrCache(size);
		this._requireAuthZ =
			typeof opts.requireAuthZ === 'boolean' ? opts.requireAuthZ : true;

		if (opts.data) this.loadCache(opts.data);
		this._requireAuthZ;
	}

	public set(key: string, value: string[]) {
		this._cache.set(key, value);
	}

	public get(key: string): string[] {
		return this._cache.get(key);
	}

	public has(key: string): boolean {
		return this._cache.has(key);
	}

	public loadCache(data: AzrData[]) {
		if (
			data &&
			Array.isArray(data) &&
			data.length > 0 &&
			data[0]?.hasOwnProperty('clientId') &&
			typeof data[0]?.clientId === 'string' &&
			data[0]?.hasOwnProperty('scope') &&
			typeof data[0]?.scope === 'string'
		) {
			for (const item of data) {
				this.set(item.clientId, item.scope.split(' '));
			}
		}
	}

	public middleware(
		req: RequestWithJwtScopes,
		res: Response,
		next: NextFunction
	) {
		req.azrScopes = [];
		if (req.jwtPayload && req.jwtPayload.sub)
			req.azrScopes = this.get(req.jwtPayload.sub);
		if (this._requireAuthZ && req.azrScopes.length === 0)
			return next(new ErrorWithStatus(401, 'Unauthorized'));

		return next();
	}
}
