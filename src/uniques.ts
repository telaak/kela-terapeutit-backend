import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client
 * @const
 */

const prisma = new PrismaClient();

/**
 * Unused, checked for duplicate names and found out they're unique
 */

async function checkDuplicates() {
  const names = (await prisma.therapist.findMany({})).map((t) => t.name);
  const uniq = names
    .map((name) => {
      return {
        count: 1,
        name: name,
      };
    })
    .reduce((result: any, b) => {
      result[b.name] = (result[b.name] || 0) + b.count;

      return result;
    }, {});
  const duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);

  console.log(duplicates);
}

checkDuplicates();
