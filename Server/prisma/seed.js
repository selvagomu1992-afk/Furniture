// prisma/seed.js — Seed initial products
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';
import bcrypt from 'bcrypt';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Jangid database...');

  // ─── Collections ────────────────────────────
  const collections = [
    { name: 'Living Room', slug: 'living-room', description: 'Sofas, armchairs, coffee tables and more for your living space.' },
    { name: 'Dining',      slug: 'dining',      description: 'Dining tables, sideboards and chairs crafted for shared meals.' },
    { name: 'Bedroom',     slug: 'bedroom',     description: 'Bed frames, nightstands and dressers for restful spaces.' },
    { name: 'Office',      slug: 'office',      description: 'Desks, shelving and storage for the home workspace.' },
  ];

  for (const c of collections) {
    await prisma.collection.upsert({
      where:  { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`✅ ${collections.length} collections seeded`);

  // ─── Default Settings ─────────────────────────
  const defaultSettings = [
    { key: 'company_name',    value: 'Jangid' },
    { key: 'company_address', value: '12 Artisan Lane, Burlington, Vermont, VT 05401' },
    { key: 'company_phone',   value: '+1 (802) 555-0147' },
    { key: 'company_email',   value: 'studio@jangid.com' },
    { key: 'delivery_rate',   value: '150' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✅ ${defaultSettings.length} settings seeded`);

  // ─── Admin User ──────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where:  { email: 'admin@jangid.com' },
    update: {},
    create: {
      firstName:    'Jangid',
      lastName:     'Admin',
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

  // ─── Hero Slides ────────────────────────────
  const existingSlides = await prisma.heroSlide.count();
  if (existingSlides === 0) {
    const FE = process.env.CLIENT_URL || 'https://sofazone.onrender.com';
    const heroSeed = [
      { order: 1, imageUrl: `${FE}/hero.png`,         title: 'Furniture <span class="italic">crafted</span> with soul.',                  subtitle: 'Handmade to order using sustainably sourced solid woods and premium upholstery.' },
      { order: 2, imageUrl: `${FE}/dining_table.png`,  title: 'Heirloom quality, <span class="italic">made for you.</span>',               subtitle: 'Every piece tells a story. From our workshop to your home.' },
      { order: 3, imageUrl: `${FE}/armchair.png`,      title: 'Solid Walnut. <span class="italic">Built to last.</span>',                   subtitle: 'Each joint hand-cut, each surface hand-finished by master artisans.' },
      { order: 4, imageUrl: `${FE}/bed_frame.png`,     title: 'Your vision, <span class="italic">our craft.</span>',                        subtitle: 'Commission a bespoke piece tailored to your space, style, and needs.' },
      { order: 5, imageUrl: `${FE}/coffee_table.png`,  title: 'Sustainable luxury <span class="italic">for every home.</span>',             subtitle: 'FSC-certified timber, traditional joinery, and a 15-year guarantee.' },
    ];
    for (const s of heroSeed) {
      await prisma.heroSlide.create({ data: { ...s, active: true } });
    }
    console.log(`✅ ${heroSeed.length} hero slides seeded`);
  } else {
    console.log(`⏭️  ${existingSlides} hero slides already exist, skipping`);
  }

  console.log('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
