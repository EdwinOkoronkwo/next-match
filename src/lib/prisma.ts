import { PrismaClient } from "@prisma/client";

declare global {
  // This line ensures TypeScript knows about the prisma property on the global object
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma Client
const prisma = global.prisma || new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { prisma };
