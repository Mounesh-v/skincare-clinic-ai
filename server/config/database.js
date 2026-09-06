import mongoose from "mongoose";

let memServer = null;

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    // Try connecting to configured MONGODB_URI first
    if (uri) {
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
            console.log(`✅ MongoDB connected successfully to ${uri}`);
            return;
        } catch (error) {
            console.warn(`⚠️  Could not connect to MongoDB at "${uri}" (${error.message}).`);
            console.log(`🔄 Falling back to in-memory MongoDB for local development...`);
        }
    }

    // Fallback: MongoMemoryServer
    try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        await mongoose.connect(memUri);
        console.log(`✅ In-Memory MongoDB running and connected at: ${memUri}`);

        // Auto-seed initial products if empty
        const { default: Product } = await import("../models/Product.js");
        const count = await Product.countDocuments();
        if (count === 0) {
            const seedModule = await import("../scripts/seedProductsData.js").catch(() => null);
            if (seedModule && seedModule.seedProductsList) {
                for (const p of seedModule.seedProductsList) {
                    await new Product(p).save();
                }
                console.log(`🌱 Auto-seeded default products into in-memory database.`);
            }
        }
    } catch (err) {
        console.error(`❌ MongoDB connection error:`, err);
        process.exit(1);
    }
};

export default connectDB;