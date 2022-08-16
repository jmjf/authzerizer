import { AZRCache } from './AZRCache';

describe('AZRCache', () => {
	test('when setting data with an invalid key, it throws an error', () => {
		// Arrange
		const azrCache = new AZRCache(10);

		// Assert
		expect(() => azrCache.set(1 as unknown as string, ['nope'])).toThrowError(
			new Error('Invalid key')
		);
	});

	test('when setting data with an invalid value, it throws an error', () => {
		// Arrange
		const azrCache = new AZRCache(10);

		// Assert
		expect(() => azrCache.set('one', [1 as unknown as string])).toThrowError(
			new Error('Invalid value')
		);
	});

	test('when a key has been added to the cache, has(key) returns true and get(key) returns the values', () => {
		// Arrange
		const azrCache = new AZRCache(10);
		const key1 = 'one';
		const value1 = ['yes'];
		const key2 = 'two';
		const value2 = ['maybe'];

		// Assert starting state is as expected -- neither key exists at the beginning
		expect(azrCache.has(key1)).toBe(false);
		expect(azrCache.has(key2)).toBe(false);

		// add both keys
		azrCache.set(key1, value1);
		azrCache.set(key2, value2);

		// Assert -- has(key)
		expect(azrCache.has(key1)).toBe(true);
		expect(azrCache.has(key2)).toBe(true);

		// Assert -- get(key)
		expect(azrCache.get(key1)).toMatchObject(value1);
		expect(azrCache.get(key2)).toMatchObject(value2);
	});

	test('when a key has not been added to the cache, has(key) returns false, get(key) returns [])', () => {
		// Arrange
		const azrCache = new AZRCache(10);
		azrCache.set('two', ['nope']);

		// Assert
		expect(azrCache.has('one')).toBe(false);
		expect(azrCache.get('one').length).toBe(0);
	});
});
