/**
 * Used to delete everything
 */

import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client
 * @const
 */

const prisma = new PrismaClient();

prisma.therapist.deleteMany({}).then(console.log)