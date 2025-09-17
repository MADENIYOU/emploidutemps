/*
  Warnings:

  - You are about to drop the column `dayOff` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "dayOff" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "hoursPerWeek" REAL NOT NULL,
    CONSTRAINT "Course_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("hoursPerWeek", "id", "level", "subjectId") SELECT "hoursPerWeek", "id", "level", "subjectId" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_level_subjectId_key" ON "Course"("level", "subjectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
