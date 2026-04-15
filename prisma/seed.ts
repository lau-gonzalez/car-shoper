import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.agency.upsert({
    where: { slug: 'demo-motors' },
    update: {},
    create: {
      name: 'Demo Motors',
      slug: 'demo-motors',
      logo: 'https://placehold.co/200x80?text=Demo+Motors',
      primaryColor: '#2563eb',
      contactEmail: 'info@demomotors.example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, USA',
    },
  });

  const hashedPassword = await hash('password123', 12);
  await prisma.seller.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo Seller',
      agencyId: agency.id,
    },
  });

  const cars = [
    { make: 'Toyota', model: 'Camry', year: 2024, price: 28500, mileage: 5200, description: 'Excellent condition, one owner, full service history.', status: 'available' },
    { make: 'Honda', model: 'Civic', year: 2023, price: 24000, mileage: 12000, description: 'Sport trim with sunroof and premium audio.', status: 'available' },
    { make: 'Ford', model: 'Mustang', year: 2024, price: 42000, mileage: 3500, description: 'GT package, V8 engine, magnetic ride suspension.', status: 'available' },
    { make: 'BMW', model: '3 Series', year: 2022, price: 38000, mileage: 22000, description: 'M Sport package, leather interior, navigation.', status: 'available' },
    { make: 'Tesla', model: 'Model 3', year: 2023, price: 35000, mileage: 15000, description: 'Long range, autopilot, white interior.', status: 'sold' },
    { make: 'Chevrolet', model: 'Silverado', year: 2024, price: 52000, mileage: 800, description: 'LTZ trim, crew cab, towing package.', status: 'available' },
  ];

  for (const car of cars) {
    await prisma.car.upsert({
      where: { id: `seed-${car.make.toLowerCase()}-${car.model.toLowerCase()}` },
      update: {},
      create: {
        id: `seed-${car.make.toLowerCase()}-${car.model.toLowerCase()}`,
        ...car,
        images: '[]',
        agencyId: agency.id,
      },
    });
  }

  console.log('Seed complete: Demo Motors agency with 6 cars and 1 seller');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
