import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
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
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
