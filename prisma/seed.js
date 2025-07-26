import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // ลบข้อมูลเก่า
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()

  // สร้างเมนูใหม่
  const menuItems = [
    { name: 'ชาไทยเย็น', price: 25, category: 'ชาเย็น' },
    { name: 'ชาไทยร้อน', price: 20, category: 'ชาร้อน' },
    { name: 'ชาเขียวเย็น', price: 25, category: 'ชาเย็น' },
    { name: 'ชาเขียวร้อน', price: 20, category: 'ชาร้อน' },
    { name: 'ชาดำเย็น', price: 20, category: 'ชาเย็น' },
    { name: 'ชาดำร้อน', price: 15, category: 'ชาร้อน' },
    { name: 'ชาไทยปั่น', price: 35, category: 'ชาปั่น' },
    { name: 'ชาเขียวปั่น', price: 35, category: 'ชาปั่น' },
    { name: 'กาแฟเย็น', price: 30, category: 'กาแฟ' },
    { name: 'กาแฟร้อน', price: 25, category: 'กาแฟ' },
    { name: 'โอเลี้ยง', price: 35, category: 'เครื่องดื่มพิเศษ' },
    { name: 'น้ำแดง', price: 15, category: 'เครื่องดื่มพิเศษ' }
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item
    })
  }

  console.log('✅ Seed ข้อมูลเมนูสำเร็จแล้ว!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
