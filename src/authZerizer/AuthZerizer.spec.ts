import { NextFunction, Response } from 'express';
import { ErrorWithStatus } from '../authNerizer/authNerizer-express';
import { AuthZerizer, AzrData, RequestWithJwtScopes } from './AuthZerizer';

describe('AuthZerizer', () => {
	const unauthorizedError = new ErrorWithStatus(401, 'Unauthorized');

	test('constructor: when data scope is not a string, cache does not load data', () => {
		const azr = new AuthZerizer({
			data: [{ clientId: `1`, scope: 2 }] as unknown as AzrData[],
		});

		expect(azr.has('1')).toBe(false);
	});

	test('constructor | when data is good, passed values are found', () => {
		// Arrange
		const data = [
			{ clientId: 'client1', scope: 'scope1 scope2' },
			{ clientId: 'client2', scope: 'scope2 scope3' },
			{ clientId: 'client3', scope: 'who what when' },
		];
		const azr = new AuthZerizer({ data });

		// Assert
		expect(azr.get('client1')).toMatchObject(['scope1', 'scope2']);
		expect(azr.get('client2')).toMatchObject(['scope2', 'scope3']);
		expect(azr.get('client3')).toMatchObject(['who', 'what', 'when']);
		expect(azr.get('nope')).toMatchObject([]);
	});

	test.each([
		{ raz: true, msg: ' it errors (401),' },
		{ raz: false, msg: '' },
	])(
		'middleware | when requireAuthZ is $raz and the request has no jwtPayload,$msg azrScopes is []',
		({ raz }) => {
			const data = [
				{ clientId: 'client1', scope: 'scope1 scope2' },
				{ clientId: 'client2', scope: 'scope2 scope3' },
				{ clientId: 'client3', scope: 'who what when' },
			];
			const azr = new AuthZerizer({ data, requireAuthZ: raz });
			let mockRequest: Partial<RequestWithJwtScopes>;
			let mockResponse: Partial<Response>;
			let mockNext = jest.fn();

			mockRequest = {};
			mockResponse = {
				json: jest.fn(),
				status: jest.fn(),
			};

			azr.middleware(
				mockRequest as RequestWithJwtScopes,
				mockResponse as Response,
				mockNext as NextFunction
			);

			expect(mockNext).toBeCalledTimes(1);
			raz
				? expect(mockNext).toBeCalledWith(unauthorizedError)
				: expect(mockNext).toBeCalledWith();

			expect(mockRequest.azrScopes).toBeDefined();
			expect(mockRequest.azrScopes?.length).toBe(0);
		}
	);

	test.each([
		{ raz: true, msg: ' it errors (401),' },
		{ raz: false, msg: '' },
	])(
		'middleware | when requireAuthZ is false and the request jwtPayload has no sub,$msg azrScopes is []]',
		({ raz }) => {
			const data = [
				{ clientId: 'client1', scope: 'scope1 scope2' },
				{ clientId: 'client2', scope: 'scope2 scope3' },
				{ clientId: 'client3', scope: 'who what when' },
			];
			const azr = new AuthZerizer({ data, requireAuthZ: raz });
			let mockRequest: Partial<RequestWithJwtScopes>;
			let mockResponse: Partial<Response>;
			let mockNext = jest.fn();

			mockRequest = { jwtPayload: { aud: 'test' } };
			mockResponse = {
				json: jest.fn(),
				status: jest.fn(),
			};

			azr.middleware(
				mockRequest as RequestWithJwtScopes,
				mockResponse as Response,
				mockNext as NextFunction
			);

			expect(mockNext).toBeCalledTimes(1);
			raz
				? expect(mockNext).toBeCalledWith(unauthorizedError)
				: expect(mockNext).toBeCalledWith();
			expect(mockRequest.azrScopes).toBeDefined();
			expect(mockRequest.azrScopes?.length).toBe(0);
		}
	);

	test.each([
		{ raz: true, msg: ' it errors (401),' },
		{ raz: false, msg: '' },
	])(
		'middleware | when requireAuthZ is $raz and the sub gets no azrScopes,$msg azrScopes is []',
		({ raz }) => {
			const data = [
				{ clientId: 'client1', scope: 'scope1 scope2' },
				{ clientId: 'client2', scope: 'scope2 scope3' },
				{ clientId: 'client3', scope: 'who what when' },
			];
			const azr = new AuthZerizer({ data, requireAuthZ: raz });
			let mockRequest: Partial<RequestWithJwtScopes>;
			let mockResponse: Partial<Response>;
			let mockNext = jest.fn();

			mockRequest = { jwtPayload: { sub: 'test' } };
			mockResponse = {
				json: jest.fn(),
				status: jest.fn(),
			};

			azr.middleware(
				mockRequest as RequestWithJwtScopes,
				mockResponse as Response,
				mockNext as NextFunction
			);

			expect(mockNext).toBeCalledTimes(1);
			raz
				? expect(mockNext).toBeCalledWith(unauthorizedError)
				: expect(mockNext).toBeCalledWith();
			expect(mockRequest.azrScopes).toBeDefined();
			expect(mockRequest.azrScopes?.length).toBe(0);
		}
	);

	test('middleware | when the sub is found, azrScopes is set to the expected value', () => {
		const data = [
			{ clientId: 'client1', scope: 'scope1 scope2' },
			{ clientId: 'client2', scope: 'scope2 scope3' },
			{ clientId: 'client3', scope: 'who what when' },
		];
		const azr = new AuthZerizer({ data, requireAuthZ: true });
		let mockRequest: Partial<RequestWithJwtScopes>;
		let mockResponse: Partial<Response>;
		let mockNext = jest.fn();

		mockRequest = { jwtPayload: { sub: 'client2' } };
		mockResponse = {
			json: jest.fn(),
			status: jest.fn(),
		};

		azr.middleware(
			mockRequest as RequestWithJwtScopes,
			mockResponse as Response,
			mockNext as NextFunction
		);

		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith();
		expect(mockRequest.azrScopes).toBeDefined();
		expect(mockRequest.azrScopes).toMatchObject(['scope2', 'scope3']);
	});
});
