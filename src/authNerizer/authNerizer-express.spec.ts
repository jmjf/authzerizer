import { generateKeyPairSync } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
	AuthNerizerOptions,
	buildAuthNerizer,
	ErrorWithStatus,
	RequestWithJwtPayload,
} from './authNerizer-express';

// need to generate a token, so get a signer
import { createSigner } from 'fast-jwt';

describe('buildAuthNerizer', () => {
	// async ... await ... rejects required because it's an async function and throw is tricky

	test('when no options for publicKey or JWKS, it throws an error', async () => {
		// Assert
		await expect(buildAuthNerizer).rejects.toThrowError('requires publicKey');
	});

	test('when no publicKey and only one JWKS option, it throws an error', async () => {
		// Arrange
		const getJwksOptions = { max: 100 };
		const getPublicKeyOptions = { kid: 'none' };

		// Assert
		await expect(buildAuthNerizer({ getJwksOptions })).rejects.toThrowError(
			'requires publicKey'
		);
		await expect(
			buildAuthNerizer({ getPublicKeyOptions })
		).rejects.toThrowError('requires publicKey');
	});

	test('when options are good, it returns a function', async () => {
		// Arrange
		const opts = {
			publicKey: 'secret',
		};

		// Act
		const result = await buildAuthNerizer(opts);

		// Assert
		expect(typeof result).toBe('function');
	});
});

describe('authNerizer', () => {
	let mockRequest: Partial<RequestWithJwtPayload>;
	let mockResponse: Partial<Response>;
	let mockNext = jest.fn();

	const { publicKey, privateKey } = generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem',
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem',
		},
	});

	const sign = createSigner({ key: privateKey, algorithm: 'RS256' });
	const goodPayload = { a: 1, b: 2 };
	const expiredPayload = { a: 1, b: 2, iat: 123, exp: 456 }; // exp in the past
	const goodToken = sign(goodPayload);
	const expiredToken = sign(expiredPayload);

	goodToken ? true : false;

	beforeEach(() => {
		mockRequest = {};
		mockResponse = {
			json: jest.fn(),
			status: jest.fn(),
		};
		mockNext.mockReset();
	});

	/**
 * Types of property 'get' are incompatible.
    Type '{ (name: "set-cookie"): string[] | undefined; (name: string): string | undefined; } | undefined' is not assignable to type '{ (name: "set-cookie"): string[] | undefined; (name: string): string | undefined; }'.
      Type 'undefined' is not assignable to type '{ (name: "set-cookie"): string[] | undefined; (name: string): string | undefined; }'.ts(2345)
 */

	describe('requireValidToken false', () => {
		const opts: AuthNerizerOptions = {
			requireValidToken: false,
			publicKey,
		};

		test('when request has no Authorization header, it passes the request; jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn();

			// Act
			mw(
				mockRequest as Request,
				mockResponse as Response,
				mockNext as NextFunction
			);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has Authorization not Bearer, it passes the request; jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue('Basic 1234');

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has invalid token, it passes the request; jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue(`Bearer ${expiredToken}`);

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has valid token, it passes the request; jwtPayload matches goodPayload', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue(`Bearer ${goodToken}`);

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toMatchObject(goodPayload);
		});
	});

	describe('requireValidToken true', () => {
		const opts: AuthNerizerOptions = {
			// leave unset so we prove it defaults to true
			publicKey,
		};

		const unauthorizedError = new ErrorWithStatus(401, 'Unauthorized');

		test('when request has no Authorization header, it rejects the request (401); jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn();

			// Act
			mw(
				mockRequest as Request,
				mockResponse as Response,
				mockNext as NextFunction
			);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith(unauthorizedError);
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has Authorization not Bearer, it rejects the request (401); jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue('Basic 1234');

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith(unauthorizedError);
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has invalid token, it rejects the request (401); jwtPayload undefined', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue(`Bearer ${expiredToken}`);

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith(unauthorizedError);
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toBeUndefined();
		});

		test('when request has valid token, it passes the request; jwtPayload matches goodPayload', async () => {
			// Arrange
			const mw = await buildAuthNerizer(opts);

			mockRequest.get = jest.fn().mockReturnValue(`Bearer ${goodToken}`);

			// Act
			mw(mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledWith();
			expect(mockRequest).toHaveProperty('jwtPayload');
			expect(mockRequest.jwtPayload).toMatchObject(goodPayload);
		});
	});

	// const opts = { publicKey: 'test' };

	// test('when it gets no token, it calls next() with 401', async () => {
	// 	// Arrange
	// 	const authNerizer = await buildAuthNerizer(opts);

	// 	// Act
	// 	const result = authNerizer(
	// 		mockRequest as Request,
	// 		mockResponse as Response,
	// 		mockNext
	// 	);

	// 	// Assert
	// });
});
