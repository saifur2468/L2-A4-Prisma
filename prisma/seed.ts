import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Demo Admin', email: 'admin@rentnest.com', password: 'Admin@123', role: 'ADMIN' },
    { name: 'Demo Landlord', email: 'landlord@rentnest.com', password: 'Landlord@123', role: 'LANDLORD' },
    { name: 'Demo Tenant', email: 'tenant@rentnest.com', password: 'Tenant@123', role: 'TENANT' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: await bcrypt.hash(u.password, 10) },
    });
  }
}

main().finally(() => prisma.$disconnect());