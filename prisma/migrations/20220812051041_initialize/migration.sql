-- CreateTable
CREATE TABLE "Author" (
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("authorId")
);

-- CreateTable
CREATE TABLE "LibraryResource" (
    "resourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "lcCallNumber" TEXT NOT NULL,
    "ddCallNumber" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "publisherName" TEXT NOT NULL,
    "publishedDate" TEXT NOT NULL,

    CONSTRAINT "LibraryResource_pkey" PRIMARY KEY ("resourceId")
);

-- CreateTable
CREATE TABLE "LibraryResourceSubject" (
    "subjectId" TEXT NOT NULL,
    "subjectText" TEXT NOT NULL,
    "libraryResourceResourceId" TEXT,

    CONSTRAINT "LibraryResourceSubject_pkey" PRIMARY KEY ("subjectId")
);

-- CreateTable
CREATE TABLE "LibraryResourceToAuthor" (
    "resourceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_authorId_key" ON "Author"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Author_authorName_key" ON "Author"("authorName");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResource_resourceId_key" ON "LibraryResource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResourceSubject_subjectId_key" ON "LibraryResourceSubject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResourceSubject_subjectText_key" ON "LibraryResourceSubject"("subjectText");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryResourceToAuthor_resourceId_authorId_roleName_key" ON "LibraryResourceToAuthor"("resourceId", "authorId", "roleName");

-- AddForeignKey
ALTER TABLE "LibraryResourceSubject" ADD CONSTRAINT "LibraryResourceSubject_libraryResourceResourceId_fkey" FOREIGN KEY ("libraryResourceResourceId") REFERENCES "LibraryResource"("resourceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResourceToAuthor" ADD CONSTRAINT "LibraryResourceToAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("authorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryResourceToAuthor" ADD CONSTRAINT "LibraryResourceToAuthor_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LibraryResource"("resourceId") ON DELETE RESTRICT ON UPDATE CASCADE;
