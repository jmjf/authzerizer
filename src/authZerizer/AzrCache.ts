export class AzrCache {
	private _keys;
	private _values;

	constructor(size = 1000) {
		if (size > 5000)
			throw new Error('AzrCache constructor: max size is 5000');

		this._keys = new Array<string>(size);
		this._values = new Array<string[]>(size);
		this._keys && this._values ? true : false;
	}

	public set(key: string, value: string[]): void {
		if (typeof key !== 'string') throw new Error('AzrCache set: Invalid key');

		// if it isn't an array; is an array with at least one element but type isn't string
		if (
			!Array.isArray(value) ||
			(value.length > 0 && typeof value[0] !== 'string')
		)
			throw new Error('AzrCache set: Invalid value');

		const index = this._keys.findIndex((k) => k === key);
		if (index >= 0) {
			this._values[index] = value;
		} else {
			this._keys.push(key);
			this._values.push(value);
		}
	}

	public has(key: string): boolean {
		const index = this._keys.findIndex((k) => k === key);
		return index >= 0;
	}

	public get(key: string): string[] {
		const index = this._keys.findIndex((k) => k === key);
		return index >= 1 ? [...(this._values[index] as string[])] : [];
	}
}
