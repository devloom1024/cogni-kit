// Quick database check script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if tables exist by querying
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as { table_name: string }[]

    console.log('Database tables:')
    tables.forEach(t => console.log(`  - ${t.table_name}`))

    // Try to access Asset model
    const assetCount = await prisma.asset.count()
    console.log(`\nAsset table: ${assetCount} records`)

    // Try to access WatchlistGroup model
    const groupCount = await prisma.watchlistGroup.count()
    console.log(`WatchlistGroup table: ${groupCount} records`)

    // Try to access WatchlistItem model
    const itemCount = await prisma.watchlistItem.count()
    console.log(`WatchlistItem table: ${itemCount} records`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
