import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./Badminton_court_test1.db",
})

const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      // Temporary plain value; replace with hashed password when auth backend is enabled.
      passwordHash: "admin123",
    },
  })

  await prisma.bookingSetting.upsert({
    where: { id: 1 },
    update: {
      openHour: 5,
      closeHour: 23,
      slotDuration: 2,
      peakStartHour: 17,
      lowHourPrice: 39000,
      peakHourPrice: 59000,
    },
    create: {
      id: 1,
      openHour: 5,
      closeHour: 23,
      slotDuration: 2,
      peakStartHour: 17,
      lowHourPrice: 39000,
      peakHourPrice: 59000,
    },
  })

  for (let i = 1; i <= 10; i += 1) {
    await prisma.court.upsert({
      where: { id: i },
      update: { name: `Sân ${i}`, isActive: true },
      create: { id: i, name: `Sân ${i}`, isActive: true },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
