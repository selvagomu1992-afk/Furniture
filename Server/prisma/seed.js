// prisma/seed.js — Seed initial products
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Jangid database...');

  // ─── Admin User ──────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where:  { email: 'admin@jangid.com' },
    update: {},
    create: {
      firstName:    'Aldric',
      lastName:     'Voss',
      email:        'admin@jangid.com',
      passwordHash,
      role:         'ADMIN',
    },
  });

  console.log('✅ Admin user created: admin@jangid.com / Admin@123');

  // ─── Products ─────────────────────────────────
  const products = [
    {
      name:        'Aldric Dining Table',
      slug:        'aldric-dining-table',
      category:    'DINING',
      description: 'Solid walnut with hand-shaped legs and mortise-tenon joinery. Seats 6–10.',
      basePrice:   3850,
      badge:       'bestseller',
      materials:   ['#8B5E3C', '#4E2C15', '#D4A96A'],
    },
    {
      name:        'Verity Armchair',
      slug:        'verity-armchair',
      category:    'LIVING',
      description: 'Ivory bouclé upholstery over a solid oak frame. The perfect reading companion.',
      basePrice:   2450,
      badge:       'new',
      materials:   ['#F5F0E8', '#9B7653', '#2C1810'],
    },
    {
      name:        'Heron Bed Frame',
      slug:        'heron-bed-frame',
      category:    'BEDROOM',
      description: 'Solid white oak with a floating linen headboard. Available in all bed sizes.',
      basePrice:   4200,
      badge:       null,
      materials:   ['#C9A87C', '#E8DFD0', '#4A2E1E'],
    },
    {
      name:        'Sable Coffee Table',
      slug:        'sable-coffee-table',
      category:    'LIVING',
      description: 'Calacatta marble top on brushed brass legs. A sculptural centrepiece.',
      basePrice:   3100,
      badge:       'new',
      materials:   ['#F0EDE8', '#C9B49A', '#B8A080'],
    },
    {
      name:        'Loftus Shelving Unit',
      slug:        'loftus-shelving-unit',
      category:    'OFFICE',
      description: 'Modular solid walnut shelving with adjustable heights. Flat-pack free.',
      basePrice:   2800,
      badge:       null,
      materials:   ['#8B5E3C', '#4E2C15', '#6B4226'],
    },
    {
      name:        'Quill Writing Desk',
      slug:        'quill-writing-desk',
      category:    'OFFICE',
      description: 'White oak and leather inlay desk with hidden cable management.',
      basePrice:   3350,
      badge:       'bestseller',
      materials:   ['#C9A87C', '#8B6B4C', '#D4A853'],
    },
    {
      name:        'Mira Sideboard',
      slug:        'mira-sideboard',
      category:    'DINING',
      description: 'Solid ash with herringbone veneer doors and brass pull handles.',
      basePrice:   4600,
      badge:       null,
      materials:   ['#D0B896', '#9A7A5A', '#B8860B'],
    },
    {
      name:        'Haven Sofa',
      slug:        'haven-sofa',
      category:    'LIVING',
      description: 'Three-seater with hand-tied springs, deep seat cushions, and linen upholstery.',
      basePrice:   5200,
      badge:       null,
      materials:   ['#E8DFD0', '#C4B4A0', '#8B7355'],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where:  { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log(`✅ ${products.length} products seeded`);
  console.log('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
