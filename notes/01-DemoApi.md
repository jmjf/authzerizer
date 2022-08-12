# Build a demo API

I want a demo API with a few endpoints so I can build and test my code against it.

I'm building a middleware or plugin. To actually see it work, I need an API that uses it.

## What will the demo API look like?

Let's use an API for books (library resources). This could be useful for another project that's on hold because priorities.

### Endpoints

-  GET /api/resources
-  GET /api/resources/:id
-  POST /api/resources
-  PUT /api/resources/:id

### Data structure

```typescript
type ResourceId = string;

export interface Resource {
	resourceId: string;
	title: string;
	subtitle?: string;
	authors?: Author[];
	lcCallNumber?: string;
	ddCallNumber?: string;
	isbn?: string;
	abstract?: string;
	subjects?: string[];
	publisherName?: string;
	publishedDate?: string | Date;
}

export interface Author {
	authorName: string;
	roleTerm: RoleTermType;
}
```

## Build the database

-  Get prisma
   -  `npm install --save-dev prisma`
   -  `npx prisma init`
-  Define a model for the two tables represented and migrate
   -  Create `prisma/schema.prisma`
   -  `npx prisma migrate dev --name initialize`
      -  Requires replacing `env("DATABASE_URL")` with the actual, credential-containing URL
      -  Undo when migrate finishes
   -  `npx prisma generate` to generate the client with the environment variable value
-  Load some data
   -  Get some data in `db/data.json`
   -  `npm install dotenv`

Prisma is not liking the fact that I want it to generate ids for several related things at once or get the existing ids. I think I need to

-  get a resource
-  upsert the subjects and get ids
-  upsert the authorNames and get ids and roleNames for each id
-  create the resource (without relationships) and get id
-  create subject to resource relationships using ids
-  create author to resource relationships using ids and rolenames
-  loop
