# Cache Authorization data on startup

I want to cache authorization data in memory on startup so the authorization funciton doesn't need to hit the database for every request.

## Thinking through

My basic data structure is a key/value pair. I'll need a table to hold that data.

```typescript
interface AuthZData {
	sub: string; // key - the JWT sub granted the scopes
	scopes: string[]; // value - a list of scopes to search when determining if the sub can access a route
}
```

It may be more efficient to keep the cache as two arrays, one of keys, one of values where keys[10] -> values[10], using `findIndex()`.

I can preallocate with `new Array<string>(max)`. I'll also want `get(key: string): string[]` and `set(key: string, value: string[])`. On startup, allocate the cache, read data from the database, iterate the data and `set` it in the cache.

If I want to get more sophisticated, I can get mnemonist's LRU cache (because isaacs says in performance notes on lru-cache that mnemonist/lru-cache is a better choice for short (<256 char) string keys). LRU could be advantageous if the API has a lot of users, keeping the cache size reasonable. But that can come later. LRU's evictions mean that, if the `get` failed, I'd need to interrogate the database before failing authZ. That adds `async`/`await` complexity to the middleware function.

## Plan

-  Create the cache data store
-  Load the data
-  Passing it data. Later can pass a function maybe.
-  Tests
   -  setting invalid data fails
   -  setting valid data works
   -  getting a missing key returns undefined
   -  getting an existing key returns expected value
   -  BUT: may be able to condense these into a set of tests for the load data and get functions
      -  I should be able to say, "Load good data" and get okay, then do a few gets against the result to test get
      -  So only invalid data would need a separate test
-  Write test for invalid data first (then code), then other test in steps (coding in between)

Cache API:

-  `const cache = new AZRCache(size = 1000)`
-  `cache.set(key: string, value: string[]): void`
-  `cache.get(key: string): string[]`
-  `cache.has(key: string): boolean` -- useful for testing

## Build cache class

-  Build the class with constructor and stub methods
-  Write tests and code (TDD loop)

**COMMIT: FEAT: add AZRCache to manage a simple cache of permissions from the database**

## Put client and scope data in the database

-  Serialize the permissions arrays as space-separated strings; cannot use space in permission names, which matches OAuth scopes
-  Define `ClientScope.ts` entity for TypeORM
-  Add two rows to the database
