/**
 * Seed script — run once to populate the products collection.
 * Uses the real Product model so pre-save hooks (slug generation) fire correctly.
 *
 * Usage:  node server/scripts/seedProducts.js           (skip if products exist)
 *         node server/scripts/seedProducts.js --force   (clear + re-seed)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

// Use the real Product model so pre-save hooks run (slug auto-generation, skinType casing, etc.)
const { default: Product } = await import("../models/Product.js");

const products = [
    {
        name: "CeraVe Hydrating Cleanser",
        price: 799,
        originalPrice: 999,
        category: "Cleansers",
        description: "Gentle, non-foaming face wash for normal to dry skin. Maintains the skin's natural barrier while effectively removing dirt and oil. Formulated with 3 essential ceramides (1, 3, 6-II).",
        ingredients: ["Ceramide 1", "Ceramide 3", "Ceramide 6-II", "Hyaluronic Acid", "Glycerin"],
        benefits: ["Hydrates while cleansing", "Maintains skin barrier", "Won't strip skin"],
        skinTypes: ["Dry", "Normal", "Sensitive"],
        howToUse: "Apply to wet face, lather gently and rinse thoroughly. Use morning and night.",
        images: [{ url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80", publicId: "seed-1" }],
        stock: 150,
        featured: true,
        ratings: { average: 4.8, count: 1240 },
    },
    {
        name: "Neutrogena Hydro Boost Gel Moisturizer",
        price: 1299,
        originalPrice: 1499,
        category: "Moisturizers",
        description: "Oil-free water-gel formula with hyaluronic acid that absorbs quickly and locks in moisture for up to 48 hours. Non-comedogenic and suitable for sensitive skin.",
        ingredients: ["Hyaluronic Acid", "Dimethicone", "Glycerin", "Water"],
        benefits: ["48-hour hydration", "Oil-free", "Non-comedogenic", "Absorbs quickly"],
        skinTypes: ["Oily", "Combination", "Normal"],
        howToUse: "Apply to face and neck as the last step of your morning and evening skincare routine.",
        images: [{ url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80", publicId: "seed-2" }],
        stock: 200,
        featured: true,
        ratings: { average: 4.6, count: 987 },
    },
    {
        name: "The Ordinary Niacinamide 10% Zinc 1%",
        price: 599,
        originalPrice: 699,
        category: "Serums",
        description: "A high-strength Vitamin B3 and Zinc formula that reduces the appearance of blemishes and congestion. Brightens skin tone and controls sebum.",
        ingredients: ["Niacinamide 10%", "Zinc PCA 1%", "Aqua", "Pentylene Glycol"],
        benefits: ["Reduces blemishes", "Controls sebum", "Minimizes pores", "Brightens"],
        skinTypes: ["Oily", "Combination", "Normal"],
        howToUse: "Apply a few drops to face in the morning and evening before heavier creams.",
        images: [{ url: "https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?w=400&q=80", publicId: "seed-3" }],
        stock: 300,
        featured: true,
        ratings: { average: 4.7, count: 2140 },
    },
    {
        name: "Minimalist SPF 50 Sunscreen",
        price: 449,
        originalPrice: 549,
        category: "Sunscreen",
        description: "Broad spectrum SPF 50 PA+++ sunscreen that protects against both UVA and UVB rays. No white cast, non-sticky formula suitable for daily use under makeup.",
        ingredients: ["Zinc Oxide", "Octinoxate", "Niacinamide", "Vitamin E"],
        benefits: ["SPF 50 PA+++", "No white cast", "Lightweight", "Broad spectrum"],
        skinTypes: ["All", "Oily", "Normal", "Sensitive"],
        howToUse: "Apply generously 15 minutes before sun exposure. Reapply every 2 hours.",
        images: [{ url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80", publicId: "seed-4" }],
        stock: 180,
        featured: false,
        ratings: { average: 4.5, count: 756 },
    },
    {
        name: "Innisfree Green Tea Seed Serum",
        price: 1999,
        originalPrice: 2499,
        category: "Serums",
        description: "Enriched with fresh Jeju green tea seed oil and green tea extract for intensive hydration. Lightweight formula that absorbs readily and leaves skin soft and supple.",
        ingredients: ["Green Tea Seed Oil", "Green Tea Extract", "Beta-Glucan", "Hyaluronic Acid"],
        benefits: ["Intensive hydration", "Antioxidant rich", "Softens skin", "Lightweight"],
        skinTypes: ["Dry", "Normal", "Sensitive"],
        howToUse: "After toner, gently pat 2-3 drops onto face and neck.",
        images: [{ url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", publicId: "seed-5" }],
        stock: 90,
        featured: true,
        ratings: { average: 4.9, count: 543 },
    },
    {
        name: "Biotique Bio Papaya Scrub Mask",
        price: 249,
        originalPrice: 349,
        category: "Masks",
        description: "Deep-cleansing exfoliating scrub with papaya enzymes that removes dead skin cells, unclogs pores, and leaves skin glowing with Ayurvedic herbs.",
        ingredients: ["Papaya Extract", "Walnut Powder", "Turmeric", "Honey"],
        benefits: ["Exfoliates dead skin", "Unclogs pores", "Brightens complexion", "Natural ingredients"],
        skinTypes: ["All", "Normal", "Oily"],
        howToUse: "Apply to damp face in circular motions, leave for 5 minutes, then rinse.",
        images: [{ url: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80", publicId: "seed-6" }],
        stock: 120,
        featured: false,
        ratings: { average: 4.2, count: 432 },
    },
    {
        name: "Rose Water Niacinamide Toner",
        price: 399,
        originalPrice: 499,
        category: "Toners",
        description: "A gentle, alcohol-free toner combining rose water and niacinamide to balance skin pH, minimize pore appearance, and brighten uneven skin tone.",
        ingredients: ["Rose Water", "Niacinamide 5%", "Aloe Vera", "Glycerin", "Witch Hazel"],
        benefits: ["Balances pH", "Minimizes pores", "Brightens", "Alcohol-free"],
        skinTypes: ["All", "Oily", "Combination", "Sensitive"],
        howToUse: "Apply to a cotton pad and gently swipe across face after cleansing.",
        images: [{ url: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf12?w=400&q=80", publicId: "seed-7" }],
        stock: 160,
        featured: false,
        ratings: { average: 4.4, count: 621 },
    },
    {
        name: "Dot Key Moisture Reserve Eye Cream",
        price: 699,
        originalPrice: 899,
        category: "Eye Care",
        description: "Rich, nourishing eye cream targeting dark circles, fine lines, and puffiness with caffeine and peptide complex around the delicate under-eye area.",
        ingredients: ["Caffeine", "Peptide Complex", "Vitamin C", "Hyaluronic Acid", "Shea Butter"],
        benefits: ["Reduces dark circles", "De-puffs eyes", "Firms skin", "Anti-aging"],
        skinTypes: ["All", "Dry", "Normal"],
        howToUse: "Gently tap a small amount around the orbital bone morning and night.",
        images: [{ url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80", publicId: "seed-8" }],
        stock: 75,
        featured: true,
        ratings: { average: 4.6, count: 289 },
    },
];

async function seed() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) throw new Error("MONGODB_URI not set in server/.env");

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Connected");

        const force = process.argv.includes("--force");
        const existing = await Product.countDocuments();

        if (existing > 0 && !force) {
            console.log(`ℹ️  ${existing} products already exist. Re-run with --force to replace them.`);
        } else {
            if (force && existing > 0) {
                await Product.deleteMany({});
                console.log(`🗑️  Cleared ${existing} existing products.`);
            }

            let seeded = 0;
            for (const data of products) {
                const doc = new Product(data);
                await doc.save(); // uses pre-save hooks → auto slug, skinType normalization
                seeded++;
                console.log(`  ✅ ${seeded}. ${doc.name} (slug: ${doc.slug})`);
            }
            console.log(`\n🌱 Seeded ${seeded} products successfully!`);
        }
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
        if (err.errors) {
            Object.entries(err.errors).forEach(([field, e]) =>
                console.error(`   Field '${field}': ${e.message}`)
            );
        }
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected.");
    }
}

seed();
