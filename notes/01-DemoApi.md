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

-  `npm install nanoid@^3.3.4` so I can use it (4.x is ESM only, which doesn't play well with TS yet)
-  Add entities for LibraryResource, Author, Subject, LibraryResourceToAuthor
-  A lot of tuning to get the database schema the way I want it to be
   -  But now I have a much better feel for how TypeORM declares entities with complex relationships
-  The LR to LR2A to A relationship is beyond TypeORM's abilities to deal with directly
   -  Insert authors first
   -  Then find each author and build LR2A to put on the LR
   -  Insert LR
-  That works, until I try to load another resource with and author whose name is already there
   -  `upsert` wants id and doesn't let me give a `where` term to help it decide if it needs to update or insert
   -  Also, `upsert` works on a few databases only, so take it off the table
-  What works (mostly)
   -  Build a list of distinct author names
   -  Select full author data for each name or a `new Author()` with name set if not found
      -  I could make this more efficient by assembling a `where` and doing one `find` to pull all authors, then adding new `Author`s for any not found.
   -  Save the authors
   -  Do the same for subjects minus the save because duplicate subject names on a second save to `LibraryResource` also fail
      -  I haven't done this, but it may work.
   -  Use authors and subjects to assemble a `LibraryResource`
   -  Save the `LibraryResource`

I looked at Sequelize too and I don't think it will handle this model any better. So, my conclusion is the ORMs can't cope with this type of model, specifically the M:M relationships, without some help.

Prisma is probably a better choice if binaries aren't a problem. Its upsert may work with databases TypeORM's doesn't support (doesn't say it doesn't work like TypeORM warns, but not tested). I find the model language less complex than TypeORM or Sequelize.

I need to do some more digging into both Prisma and TypeORM.

BUT, this is a demo API, so I'll simplify my model to avoid the problems I'm seeing and charge forward with TypeORM.

I'll commit so this work is saved, then start with a clean `entities` directory.

**COMMIT: CHORE: (semi-working) try to get TypeORM working for the library model**

## Simplify the model

-  Remove subjects. Move role name into `Author`
-  Move resource data into a module I can import; use it in `index.js` to load data
-  When loading, find any matching authors and combine with unmatched authors
-  Assemble `LibraryResource` and save it

It loads data.

-  rename `index.ts` to `loadWithTO.ts`

**COMMIT: CHORE: load sample data with TypeORM**

## Build the GET endpoint

-  `npm i express` and `npm i --save-dev @types/express`
-  Build the endpoint handler--nothing fancy here
-  Be sure to wrap it in a `.then()` from the data source init so the data source is connected

**COMMIT: FEAT: add GET endpoint**

## Build the POST endpoint

POST and PUT can probably mostly the same code as the data loader.

-  `buildLR()` is the core of the loader, returns a LibraryResource
-  await it and save
-  remember to `app.use(express.json())` so we get a body

**COMMIT: FEAT: add POST endpoint**

## Add GET by id endpoint

-  Same as the GET endpoint, but include a `where` term for the id
-  id from req.params.resourceId
-  test with the id from the POSTed resource above

**COMMIT: FEAT: add GET by id endpoint**

## Add PUT endpoint

-  Similar to the POST, but with GET by id's route
-  spread the body and replace resourceId with params.resourceId
-  params.resourceId must be 21 characters (because that's how long the ids are)
-  `abstract` is empty on the POSTed resource, so can change it and see results easily
-  Looks like it inserted a new one instead of recognizing the old one, let's use `update` instead of save
   -  Ah, `buildLR` will create a new `LibraryResource` and not set it's id, so set it when I get it back
   -  Now `save` works

**COMMIT: FEAT: add PUT endpoint**

For reference, the resource I POSTed

```json
{
	"title": "The secret history of the Lord of Musashi ; and, Arrowroot",
	"subtitle": "",
	"authors": [{ "authorName": "Tanizaki, Jun'ichirō", "roleTerm": "creator" }],
	"lcCallNumber": "PL839.A7 A23 1982",
	"ddCallNumber": "895.6/34",
	"isbn": "0394524543",
	"abstract": "",
	"subjects": [
		"Japanese fiction — Translations into English",
		"Japanese fiction"
	],
	"publisherName": "Knopf",
	"publishedDate": "1982",
	"resourceId": "d17eb611-9beb-4036-8aab-5ab42358991a"
}
```
