# authzerizer

A simple API AuthZ subsystem when your IdP doesn't support OAuth2 scopes

## Context

-  You have an API that's called by processes or other APIs.
-  You must authorize access to API routes.
-  You aren't using an API gateway.
-  Your OAuth2 provider doesn't support scopes.
-  Your OAuth2 provider uses client ids that aren't supported by any available authorization system.
-  Your list of client ids and scopes is relatively small.

This context may sound strange, but maybe there's a reason I think this is worth building.

## Planned solution

-  Maintain a list of allowed scopes and scopes granted to OAuth2 client ids in a database.
-  Cache the list in memory on startup.
-  Provide admin endpoints to GET, POST, PUT (update), DELETE client id scope grants in the database.
   -  On POST, PUT, DELETE, update cache
-  Get admin client id(s) from an environment variable.

For development and proof of concept, I'll start with a simple API with a couple of demo endpoints, then build the code and endpoints that use it.

## Technology decisions

-  API: Node, TypeScript, Express
-  ORM: probably Prisma (because next point)
-  Database: Given the implications of the context, something SQL
   -  In my case, Postgres because I already have one handy (in Docker).

## Ideas for the future

-  Fastify version
-  No-cache option (always read database)
-  AuthN features ???
-  UI for admin ???
-  Alternative to SQL ??? (excuse to dig into micro-database options)
-  Admin endpoints to GET, POST, PUT (update), DELETE allowed scopes in the database ???
   -  On DELETE, remove scopes from any client id grants.

## License

MIT.

Request, not a requirement: If you use this, port it to some other Node web framework, Java, C#, Carbon, Lua, AAAAAAAAAAAAAA!!!!, whatever, I'd appreciate a credit and a link if possible.
