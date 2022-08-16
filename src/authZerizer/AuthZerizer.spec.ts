import { AuthZerizer, AzrData } from './AuthZerizer';

describe('AuthZerizer', () => {
	test('when data is missing, it throws an error', () => {
		// I think the expect.assertions approach is clearer her
		expect.assertions(1);
		try {
			const azr = new AuthZerizer(null as unknown as AzrData[]);
			console.log('azr', azr);
		} catch (err) {
			expect((err as Error).message).toContain('missing data');
		}
	});

	test('when data does not have clientId and scope members, it throws an error', () => {
		// I think the expect.assertions approach is clearer her
		expect.assertions(1);
		try {
			const azr = new AuthZerizer([{ a: 1, b: 2 }] as unknown as AzrData[]);
			console.log('azr', azr);
		} catch (err) {
			expect((err as Error).message).toContain('missing clientId or scope');
		}
	});

	test('when data clientId or scope are not strings, it throws an error', () => {
		// I think the expect.assertions approach is clearer her
		expect.assertions(2);
		try {
			const azr = new AuthZerizer([
				{ clientId: 1, scope: '2' },
			] as unknown as AzrData[]);
			console.log('azr', azr);
		} catch (err) {
			expect((err as Error).message).toContain(
				'clientId or scope not string'
			);
		}

		try {
			const azr = new AuthZerizer([
				{ clientId: `1`, scope: 2 },
			] as unknown as AzrData[]);
			console.log('azr', azr);
		} catch (err) {
			expect((err as Error).message).toContain(
				'clientId or scope not string'
			);
		}
	});

	test('when data is good, passed values are found', () => {
		// Arrange
		const data = [
			{ clientId: 'client1', scope: 'scope1 scope2' },
			{ clientId: 'client2', scope: 'scope2 scope3' },
			{ clientId: 'client3', scope: 'who what when' },
		];
		const azr = new AuthZerizer(data);

		// Assert
		expect(azr.get('client1')).toMatchObject(['scope1', 'scope2']);
		expect(azr.get(`client2`)).toMatchObject(['scope2', 'scope3']);
		expect(azr.get('client3')).toMatchObject(['who', 'what', 'when']);
		expect(azr.get('nope')).toMatchObject([]);
	});
});
