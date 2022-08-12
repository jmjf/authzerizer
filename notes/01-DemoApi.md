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

**COMMIT: CHORE: (not working) try to get Prisma to handle the data the way I think it should**

## Rethink and TypeORM

I'm not afraid to change my mind, especially at this early stage.

Besides the issues I'm having above, I'm also aware that Prisma requires binary downloads. That isn't bad in itself, but in certain environments that operate from private repos with no direct access to outside repos or with tight internet access control regimes, that introduces complexity when trying to stay current.

So, switching to TypeORM because it avoids that risk. Personally, I like Prisma's model definition language better, but I'm struggling to express what I want to express in a way it understands. (This data model isn't complex.) So, TypeORM gets a chance.

### Install TypeORM

-  `npm install typeorm reflect-metadata pg` (pg because I'm using Postgres)
-  In `tsconfig.json`, in `compilerOptions`, ensure `emitDecoratorMetadata` and `experimentalDecorators` are both `true`.
-  I need to run the init. I'm going to do it in a directory outside this repo to get the files and bring the changes back to this repo.
   -  Changes to `.gitignore` in a TypeORM section I added
   -  Add `"sourcemap": true` to `tsconfig.json`
   -  Add `"typeorm": "typeorm-ts-node-commonjs"` to `package.json` in `scripts` and a start script based on theirs, but with my preferences
   -  Copied their `src`, will change below.

### Changes to base TypeORM (hello world)

-  Renamed `User.ts` to `User.entity.ts` because I want to follow that naming convention in case I spread entities in different directories
-  In `index.ts` get environment with dotenv before importing the data source so it can use `process.env`
   -  Add TYPEORM\_\* to `dev.env` and `SAMPLE`
-  In `data-source.ts`, remove `User` import, set `entities` to `['src/entity/*.entity.ts']` to pull all entities
   -  This may change in the future or for production

With that, it runs and creates a user. Now let's get complex.

**COMMIT: CHORE: get "hello world" working with TypeORM**

### Build library data model in TypeORM
