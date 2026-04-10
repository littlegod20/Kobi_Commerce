import "dotenv/config";

import { prisma } from "./prisma";

/** Replace known-broken Unsplash IDs; runs on every seed so existing DBs get fixes too. */
const PRODUCT_IMAGE_FIXES: { name: string; images: string[] }[] = [
  {
    name: "Nimbus Runner",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    name: "Pulse Headphones",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
    ],
  },
  {
    name: "Aero Jacket",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80",
    ],
  },
];

async function main() {
  for (const { name, images } of PRODUCT_IMAGE_FIXES) {
    await prisma.product.updateMany({
      where: { name },
      data: { images },
    });
  }

  const existing = await prisma.product.count();
  if (existing > 0) return;

  await prisma.product.createMany({
    data: [
      {
        name: "Nimbus Runner",
        description: "Ultralight knit upper with responsive foam cushioning.",
        priceCents: 12900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Footwear",
        inventory: 24,
      },
      {
        name: "Arc Lamp",
        description: "Brushed metal arc lamp with warm dimmable glow.",
        priceCents: 8900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Home",
        inventory: 15,
      },
      {
        name: "Studio Tote",
        description: "Structured tote with laptop sleeve and magnetic closure.",
        priceCents: 7400,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Bags",
        inventory: 35,
      },
      {
        name: "Pulse Headphones",
        description: "Balanced sound with adaptive noise cancelation.",
        priceCents: 19900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Audio",
        inventory: 18,
      },
      {
        name: "Minimal Watch",
        description: "Sapphire glass with a clean, modern dial.",
        priceCents: 15900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Accessories",
        inventory: 12,
      },
      {
        name: "Civic Hoodie",
        description: "Heavyweight fleece with a smooth, premium hand feel.",
        priceCents: 7900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Apparel",
        inventory: 40,
      },
      {
        name: "Ceramic Mug Set",
        description: "Two matte-glaze mugs designed for everyday use.",
        priceCents: 3200,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Home",
        inventory: 50,
      },
      {
        name: "Aero Jacket",
        description: "Water-resistant shell with clean seam lines.",
        priceCents: 14900,
        currency: "USD",
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=80",
        ],
        category: "Apparel",
        inventory: 16,
      }
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

