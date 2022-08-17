# Build AuthZerizer middleware

I had most of this in 03 earlier, but realized it belonged in a different major step.

## Put client and scope data in the database

-  Serialize the permissions arrays as space-separated strings; cannot use space in permission names, which matches OAuth scopes
-  Define `ClientScope.ts` entity for TypeORM
-  Add two rows to the database for the two clients I set up

**COMMIT: FEAT: add ClientScope entity and data**

## Build middleware setup

The plan is to set `req.azrScopes` with an array of scopes.

-  Create cache, load data
-  The setup should take an array of key/value results from the database--keep database logic out of it
   -  I may rethink this later, but this gives flexibility for developers using it

I'm going to return an object that includes a `middleware` function. It will also include a `loadCache` function that takes an array of k/v pairs and `set` that exposes the cache's `set` to allow single-key sets. This approach sets me up to support adding data later with an admin API and supports more complete testing (add `get` for better testing).

I'll do this by extending `AZRCache` on the belief I can extend one of the alternate LRUs I might use (based on a quick test that suggests it will work). That way, I get the cache's public API automatically and only need to add new features.

-  Tests for `loadCache`
   -  When data is missing, it throws an error
   -  When data does not have clientId and scope members, it throws an error
   -  When clientId or scope is not a string, it throws an error
   -  When data is good, expected values are found

I won't test `set` or `get` because they're just passthroughs.

-  First, I need to add a test to `AZRCache` -- when setting an existing key, the value changes
-  Stub out the `AuthZerizer` class
-  Write tests for throws
-  Write code to pass tests
-  Write test for data good
-  Write code to pass test
-  Stub out middleware function
-  Rename `AZRCache` to `AzrCache`

**COMMIT: FEAT: add AuthZerizer class and setup**

## Rethinking a bit

I think it may be better to have AuthZerizer use the cache than extend it. If I use an LRU, I'll need a `get()` method that can read the database if the key isn't in the cache. So, let's use the cache.

I'll also allow constructing without data. If constructed without data, the cache will be empty until something calls `set()` or `loadCache()`.

Future, I'll want to pass two functions to the constructor--one to read a client id's data from the database and another to write data to the database. That can be future, though.

## Build middleware function

Tests for middleware

-  azrScopes is [] when
   -  no jwtPayload
   -  jwtPayload has no sub
   -  jwtPayload.sub is not found
   -  if requireAuthZ, above cases error the request (401)
-  When a request has a known client, azrScopes contains the expected values

Tests written. Code passes.

**COMMIT: FEAT: add middleware to get authorization scopes from the cache**

Cleanup

-  `ErrorWithStatus` is shared between AuthNerizer and AuthZerizer
-  AuthZerizer needs `RequestWithJwtPayload` -- rename to `RequestWithJwt`
-  Generally review code looking for opportunities to make it cleaner
-  Remove any unneeded imports
