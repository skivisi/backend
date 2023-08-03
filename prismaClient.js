// prismaClient.js
const { PrismaClient } = require("@prisma/client");

let prisma;

function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

module.exports = getPrismaClient;
