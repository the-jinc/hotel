import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import {
  users,
  roomCategories,
  rooms,
  bookings,
  bookingRooms,
  payments,
  foodCategories,
  foodItems,
  foodOrders,
  foodOrderItems,
  auditLogs,
} from "../db/schema.js";

// Database connection
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://hotel_user:hotel_password@localhost:5432/hotel_db";
const client = postgres(connectionString);
const db = drizzle(client);

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await db.delete(auditLogs);
    await db.delete(foodOrderItems);
    await db.delete(foodOrders);
    await db.delete(foodItems);
    await db.delete(foodCategories);
    await db.delete(payments);
    await db.delete(bookingRooms);
    await db.delete(bookings);
    await db.delete(rooms);
    await db.delete(roomCategories);
    await db.delete(users);

    // 1. Seed Users with different roles
    console.log("👥 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const seedUsers = await db
      .insert(users)
      .values([
        {
          email: "admin@hotel.com",
          password: hashedPassword,
          firstName: "Hotel",
          lastName: "Administrator",
          role: "admin",
          phone: "+1-555-0001",
        },
        {
          email: "manager@hotel.com",
          password: hashedPassword,
          firstName: "Hotel",
          lastName: "Manager",
          role: "manager",
          phone: "+1-555-0002",
        },
        {
          email: "receptionist@hotel.com",
          password: hashedPassword,
          firstName: "Hotel",
          lastName: "Receptionist",
          role: "receptionist",
          phone: "+1-555-0003",
        },
        {
          email: "guest1@example.com",
          password: hashedPassword,
          firstName: "John",
          lastName: "Doe",
          role: "guest",
          phone: "+1-555-1001",
        },
        {
          email: "guest2@example.com",
          password: hashedPassword,
          firstName: "Jane",
          lastName: "Smith",
          role: "guest",
          phone: "+1-555-1002",
        },
        {
          email: "guest3@example.com",
          password: hashedPassword,
          firstName: "Bob",
          lastName: "Johnson",
          role: "guest",
          phone: "+1-555-1003",
        },
      ])
      .returning();

    console.log(`✅ Created ${seedUsers.length} users`);

    // 2. Seed Room Categories
    console.log("🏨 Seeding room categories...");
    const seedCategories = await db
      .insert(roomCategories)
      .values([
        {
          name: "Standard Room",
          description:
            "Comfortable and affordable accommodation with essential amenities.",
          basePrice: "89.99",
          maxOccupancy: 2,
          amenities: JSON.stringify([
            "Free WiFi",
            "Air Conditioning",
            "Private Bathroom",
            "TV",
            "Coffee Maker",
            "Daily Housekeeping",
          ]),
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          ]),
        },
        {
          name: "Deluxe Room",
          description: "Spacious room with premium amenities and city view.",
          basePrice: "149.99",
          maxOccupancy: 3,
          amenities: JSON.stringify([
            "Free WiFi",
            "Air Conditioning",
            "Private Bathroom",
            "Smart TV",
            "Mini Fridge",
            "Coffee Machine",
            "City View",
            "Work Desk",
            "Daily Housekeeping",
            "Room Service",
          ]),
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1594560913095-8cf34bab916d?w=800",
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
          ]),
        },
        {
          name: "Executive Suite",
          description:
            "Luxurious suite with separate living area and premium services.",
          basePrice: "249.99",
          maxOccupancy: 4,
          amenities: JSON.stringify([
            "Free WiFi",
            "Air Conditioning",
            "Private Bathroom",
            "Smart TV",
            "Mini Bar",
            "Espresso Machine",
            "Ocean View",
            "Living Area",
            "Work Desk",
            "Balcony",
            "Premium Linens",
            "24/7 Room Service",
            "Concierge Service",
          ]),
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
          ]),
        },
        {
          name: "Presidential Suite",
          description:
            "The ultimate luxury experience with panoramic views and exclusive services.",
          basePrice: "499.99",
          maxOccupancy: 6,
          amenities: JSON.stringify([
            "Free WiFi",
            "Air Conditioning",
            "Master Bathroom with Jacuzzi",
            "Multiple Smart TVs",
            "Full Kitchen",
            "Wine Cooler",
            "Panoramic View",
            "Multiple Bedrooms",
            "Dining Area",
            "Private Terrace",
            "Luxury Linens",
            "Butler Service",
            "Private Check-in",
            "Complimentary Breakfast",
          ]),
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          ]),
        },
      ])
      .returning();

    console.log(`✅ Created ${seedCategories.length} room categories`);

    // 3. Seed Rooms
    console.log("🚪 Seeding rooms...");
    const roomsToCreate = [];

    // Standard Rooms (Floor 1-2)
    for (let floor = 1; floor <= 2; floor++) {
      for (let roomNum = 1; roomNum <= 10; roomNum++) {
        roomsToCreate.push({
          roomNumber: `${floor}${roomNum.toString().padStart(2, "0")}`,
          categoryId: seedCategories[0].id, // Standard Room
          floor: floor,
          status: "available" as const,
          notes: floor === 1 ? "Ground floor room" : "Second floor room",
        });
      }
    }

    // Deluxe Rooms (Floor 3-4)
    for (let floor = 3; floor <= 4; floor++) {
      for (let roomNum = 1; roomNum <= 8; roomNum++) {
        roomsToCreate.push({
          roomNumber: `${floor}${roomNum.toString().padStart(2, "0")}`,
          categoryId: seedCategories[1].id, // Deluxe Room
          floor: floor,
          status: "available" as const,
          notes: `${
            floor === 3 ? "Third" : "Fourth"
          } floor room with city view`,
        });
      }
    }

    // Executive Suites (Floor 5)
    for (let roomNum = 1; roomNum <= 6; roomNum++) {
      roomsToCreate.push({
        roomNumber: `5${roomNum.toString().padStart(2, "0")}`,
        categoryId: seedCategories[2].id, // Executive Suite
        floor: 5,
        status: "available" as const,
        notes: "Fifth floor suite with ocean view",
      });
    }

    // Presidential Suites (Floor 6)
    for (let roomNum = 1; roomNum <= 2; roomNum++) {
      roomsToCreate.push({
        roomNumber: `6${roomNum.toString().padStart(2, "0")}`,
        categoryId: seedCategories[3].id, // Presidential Suite
        floor: 6,
        status: "available" as const,
        notes: "Top floor presidential suite with panoramic view",
      });
    }

    const seedRooms = await db.insert(rooms).values(roomsToCreate).returning();
    console.log(`✅ Created ${seedRooms.length} rooms`);

    // 4. Seed Sample Bookings
    console.log("📅 Seeding sample bookings...");

    // Get guest users for bookings
    const guestUsers = seedUsers.filter((user) => user.role === "guest");

    // Create some sample bookings
    const sampleBookings = await db
      .insert(bookings)
      .values([
        {
          userId: guestUsers[0].id,
          checkInDate: new Date("2025-10-05"),
          checkOutDate: new Date("2025-10-08"),
          totalAmount: "269.97", // 3 nights * $89.99
          status: "confirmed",
          guestCount: 2,
          specialRequests: "Late check-in requested",
        },
        {
          userId: guestUsers[1].id,
          checkInDate: new Date(), // Today
          checkOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          totalAmount: "299.98", // 2 nights * $149.99
          status: "confirmed",
          guestCount: 2,
          specialRequests: "Ground floor room preferred",
        },
        {
          userId: guestUsers[2].id,
          checkInDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          checkOutDate: new Date(), // Today
          totalAmount: "749.97", // 3 nights * $249.99
          status: "checked_in",
          guestCount: 3,
          specialRequests: "Anniversary celebration",
        },
      ])
      .returning();

    // 5. Seed Booking Rooms relationships
    console.log("🔗 Seeding booking-room relationships...");
    await db.insert(bookingRooms).values([
      {
        bookingId: sampleBookings[0].id,
        roomId: seedRooms[0].id, // Standard room
        nightlyRate: "89.99",
      },
      {
        bookingId: sampleBookings[1].id,
        roomId: seedRooms[20].id, // Deluxe room
        nightlyRate: "149.99",
      },
      {
        bookingId: sampleBookings[2].id,
        roomId: seedRooms[36].id, // Executive suite
        nightlyRate: "249.99",
      },
    ]);

    // 6. Seed Payments
    console.log("💳 Seeding payments...");
    await db.insert(payments).values([
      {
        bookingId: sampleBookings[0].id,
        amount: "269.97",
        paymentMethod: "credit_card",
        transactionId: "txn_1234567890",
        status: "completed",
      },
      {
        bookingId: sampleBookings[2].id,
        amount: "749.97",
        paymentMethod: "credit_card",
        transactionId: "txn_0987654321",
        status: "completed",
      },
    ]);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Test Accounts Created:");
    console.log("┌───────────────────────────────────────────────────────┐");
    console.log("│ Role          │ Email                  │ Password     │");
    console.log("├───────────────────────────────────────────────────────┤");
    console.log("│ Admin         │ admin@hotel.com        │ password123  │");
    console.log("│ Manager       │ manager@hotel.com      │ password123  │");
    console.log("│ Receptionist  │ receptionist@hotel.com │ password123  │");
    console.log("│ Guest         │ guest1@example.com     │ password123  │");
    console.log("│ Guest         │ guest2@example.com     │ password123  │");
    console.log("│ Guest         │ guest3@example.com     │ password123  │");
    console.log("└───────────────────────────────────────────────────────┘");
    console.log("\n🏨 Room Distribution:");
    console.log("- Standard Rooms: 20 (Floors 1-2)");
    console.log("- Deluxe Rooms: 16 (Floors 3-4)");
    console.log("- Executive Suites: 6 (Floor 5)");
    console.log("- Presidential Suites: 2 (Floor 6)");

    // 🍽️ Seed food categories
    console.log("\n🍽️ Creating food categories...");
    const seedFoodCategories = [
      {
        name: "Appetizers",
        description: "Start your meal with our delicious appetizers",
        isActive: true,
      },
      {
        name: "Main Courses",
        description: "Hearty and satisfying main dishes",
        isActive: true,
      },
      {
        name: "Desserts",
        description: "Sweet treats to end your meal",
        isActive: true,
      },
      {
        name: "Beverages",
        description: "Refreshing drinks and hot beverages",
        isActive: true,
      },
      {
        name: "Salads",
        description: "Fresh and healthy salad options",
        isActive: true,
      },
    ];

    const insertedFoodCategories = await db
      .insert(foodCategories)
      .values(seedFoodCategories)
      .returning();
    console.log(`✅ Created ${insertedFoodCategories.length} food categories`);

    // 🍕 Seed food items
    console.log("\n🍕 Creating food items...");
    const seedFoodItems = [
      // Appetizers
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        price: "14.99",
        categoryId: insertedFoodCategories[0].id,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: "Chicken Wings",
        description: "Spicy buffalo wings served with blue cheese dip",
        price: "16.99",
        categoryId: insertedFoodCategories[0].id,
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: "Mozzarella Sticks",
        description: "Golden fried mozzarella with marinara sauce",
        price: "12.99",
        categoryId: insertedFoodCategories[0].id,
        isAvailable: true,
        preparationTime: 12,
      },
      // Main Courses
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon herb butter",
        price: "28.99",
        categoryId: insertedFoodCategories[1].id,
        isAvailable: true,
        preparationTime: 25,
      },
      {
        name: "Ribeye Steak",
        description: "12oz premium ribeye steak with garlic mashed potatoes",
        price: "36.99",
        categoryId: insertedFoodCategories[1].id,
        isAvailable: true,
        preparationTime: 30,
      },
      {
        name: "Chicken Parmesan",
        description: "Breaded chicken breast with marinara and melted cheese",
        price: "24.99",
        categoryId: insertedFoodCategories[1].id,
        isAvailable: true,
        preparationTime: 22,
      },
      {
        name: "Vegetarian Pasta",
        description: "Penne pasta with seasonal vegetables in herb sauce",
        price: "19.99",
        categoryId: insertedFoodCategories[1].id,
        isAvailable: true,
        preparationTime: 18,
      },
      // Desserts
      {
        name: "Chocolate Cake",
        description: "Rich chocolate layer cake with chocolate ganache",
        price: "8.99",
        categoryId: insertedFoodCategories[2].id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: "9.99",
        categoryId: insertedFoodCategories[2].id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: "New York Cheesecake",
        description: "Creamy cheesecake with berry compote",
        price: "7.99",
        categoryId: insertedFoodCategories[2].id,
        isAvailable: true,
        preparationTime: 5,
      },
      // Beverages
      {
        name: "Coffee",
        description: "Fresh brewed premium coffee",
        price: "3.99",
        categoryId: insertedFoodCategories[3].id,
        isAvailable: true,
        preparationTime: 3,
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: "4.99",
        categoryId: insertedFoodCategories[3].id,
        isAvailable: true,
        preparationTime: 2,
      },
      {
        name: "Craft Beer",
        description: "Local craft beer selection",
        price: "6.99",
        categoryId: insertedFoodCategories[3].id,
        isAvailable: true,
        preparationTime: 1,
      },
      {
        name: "House Wine",
        description: "Red or white wine by the glass",
        price: "8.99",
        categoryId: insertedFoodCategories[3].id,
        isAvailable: true,
        preparationTime: 1,
      },
      // Salads
      {
        name: "Greek Salad",
        description: "Mixed greens with feta cheese, olives, and tomatoes",
        price: "13.99",
        categoryId: insertedFoodCategories[4].id,
        isAvailable: true,
        preparationTime: 8,
      },
      {
        name: "Garden Salad",
        description: "Fresh mixed greens with seasonal vegetables",
        price: "11.99",
        categoryId: insertedFoodCategories[4].id,
        isAvailable: true,
        preparationTime: 8,
      },
    ];

    const insertedFoodItems = await db
      .insert(foodItems)
      .values(seedFoodItems)
      .returning();
    console.log(`✅ Created ${insertedFoodItems.length} food items`);

    // 🍽️ Seed sample food orders
    console.log("\n🍽️ Creating sample food orders...");
    const sampleFoodOrders = await db
      .insert(foodOrders)
      .values([
        {
          userId: guestUsers[0].id,
          totalAmount: "45.97",
          status: "delivered",
          roomNumber: "101",
          specialInstructions: "Extra spicy, please knock softly",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          userId: guestUsers[1].id,
          totalAmount: "78.96",
          status: "preparing",
          roomNumber: "301",
          specialInstructions: "No onions in the salad",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        {
          userId: guestUsers[2].id,
          totalAmount: "125.94",
          status: "delivered",
          roomNumber: "501",
          specialInstructions: "Anniversary dinner - please include candles",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
        {
          userId: guestUsers[0].id,
          totalAmount: "23.97",
          status: "cancelled",
          roomNumber: "Lobby",
          specialInstructions: "Pick up at front desk",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      ])
      .returning();
    console.log(`✅ Created ${sampleFoodOrders.length} food orders`);

    // 🍕 Seed food order items
    console.log("\n🍕 Creating food order items...");
    await db.insert(foodOrderItems).values([
      // First order items (delivered)
      {
        orderId: sampleFoodOrders[0].id,
        foodItemId: insertedFoodItems[1].id, // Chicken Wings
        quantity: 1,
        unitPrice: "16.99",
        specialInstructions: "Extra sauce on the side",
      },
      {
        orderId: sampleFoodOrders[0].id,
        foodItemId: insertedFoodItems[10].id, // Coffee
        quantity: 2,
        unitPrice: "3.99",
      },
      {
        orderId: sampleFoodOrders[0].id,
        foodItemId: insertedFoodItems[8].id, // Tiramisu
        quantity: 1,
        unitPrice: "9.99",
      },
      // Second order items (preparing)
      {
        orderId: sampleFoodOrders[1].id,
        foodItemId: insertedFoodItems[3].id, // Grilled Salmon
        quantity: 1,
        unitPrice: "28.99",
      },
      {
        orderId: sampleFoodOrders[1].id,
        foodItemId: insertedFoodItems[14].id, // Greek Salad
        quantity: 1,
        unitPrice: "13.99",
        specialInstructions: "No onions",
      },
      {
        orderId: sampleFoodOrders[1].id,
        foodItemId: insertedFoodItems[13].id, // House Wine
        quantity: 2,
        unitPrice: "8.99",
      },
      {
        orderId: sampleFoodOrders[1].id,
        foodItemId: insertedFoodItems[9].id, // Cheesecake
        quantity: 1,
        unitPrice: "7.99",
      },
      // Third order items (anniversary dinner - delivered)
      {
        orderId: sampleFoodOrders[2].id,
        foodItemId: insertedFoodItems[4].id, // Ribeye Steak
        quantity: 2,
        unitPrice: "36.99",
      },
      {
        orderId: sampleFoodOrders[2].id,
        foodItemId: insertedFoodItems[13].id, // House Wine
        quantity: 2,
        unitPrice: "8.99",
      },
      {
        orderId: sampleFoodOrders[2].id,
        foodItemId: insertedFoodItems[8].id, // Tiramisu
        quantity: 2,
        unitPrice: "9.99",
      },
      // Fourth order items (cancelled)
      {
        orderId: sampleFoodOrders[3].id,
        foodItemId: insertedFoodItems[10].id, // Coffee
        quantity: 3,
        unitPrice: "3.99",
      },
      {
        orderId: sampleFoodOrders[3].id,
        foodItemId: insertedFoodItems[2].id, // Mozzarella Sticks
        quantity: 1,
        unitPrice: "12.99",
      },
    ]);

    // 📋 Seed audit logs for realistic system activity
    console.log("\n📋 Creating audit log entries...");
    const sampleAuditLogs = [
      // User creation logs
      {
        userId: seedUsers[0].id, // Admin
        action: "CREATE",
        tableName: "users",
        recordId: seedUsers[3].id, // Guest1
        newValues: JSON.stringify({
          email: "guest1@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "guest",
        }),
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      // Room creation logs
      {
        userId: seedUsers[1].id, // Manager
        action: "CREATE",
        tableName: "rooms",
        recordId: seedRooms[0].id,
        newValues: JSON.stringify({
          roomNumber: "101",
          categoryId: seedCategories[0].id,
          status: "available",
        }),
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      // Booking creation
      {
        userId: guestUsers[0].id,
        action: "CREATE",
        tableName: "bookings",
        recordId: sampleBookings[0].id,
        newValues: JSON.stringify({
          checkInDate: "2025-10-05",
          checkOutDate: "2025-10-08",
          totalAmount: "269.97",
          status: "confirmed",
        }),
        ipAddress: "203.0.113.45",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      // Payment processing
      {
        userId: guestUsers[0].id,
        action: "CREATE",
        tableName: "payments",
        recordId: "txn_1234567890",
        newValues: JSON.stringify({
          bookingId: sampleBookings[0].id,
          amount: "269.97",
          paymentMethod: "credit_card",
          status: "completed",
        }),
        ipAddress: "203.0.113.45",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      // Booking status updates
      {
        userId: seedUsers[2].id, // Receptionist
        action: "UPDATE",
        tableName: "bookings",
        recordId: sampleBookings[2].id,
        oldValues: JSON.stringify({ status: "confirmed" }),
        newValues: JSON.stringify({ status: "checked_in" }),
        ipAddress: "192.168.1.102",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      // Food order activities
      {
        userId: guestUsers[1].id,
        action: "CREATE",
        tableName: "food_orders",
        recordId: sampleFoodOrders[1].id,
        newValues: JSON.stringify({
          totalAmount: "78.96",
          status: "placed",
          deliveryAddress: "Room 301",
        }),
        ipAddress: "198.51.100.25",
        userAgent:
          "Mozilla/5.0 (Android 12; Mobile; rv:95.0) Gecko/95.0 Firefox/95.0",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        userId: seedUsers[1].id, // Manager
        action: "UPDATE",
        tableName: "food_orders",
        recordId: sampleFoodOrders[1].id,
        oldValues: JSON.stringify({ status: "placed" }),
        newValues: JSON.stringify({ status: "preparing" }),
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      // Room management activities
      {
        userId: seedUsers[1].id, // Manager
        action: "UPDATE",
        tableName: "rooms",
        recordId: seedRooms[5].id,
        oldValues: JSON.stringify({ status: "available" }),
        newValues: JSON.stringify({ status: "cleaning" }),
        ipAddress: "192.168.1.101",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      // Food item management
      {
        userId: seedUsers[0].id, // Admin
        action: "UPDATE",
        tableName: "food_items",
        recordId: insertedFoodItems[6].id, // Vegetarian Pasta
        oldValues: JSON.stringify({ price: "18.99" }),
        newValues: JSON.stringify({ price: "19.99" }),
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      // Order cancellation
      {
        userId: guestUsers[0].id,
        action: "UPDATE",
        tableName: "food_orders",
        recordId: sampleFoodOrders[3].id,
        oldValues: JSON.stringify({ status: "placed" }),
        newValues: JSON.stringify({ status: "cancelled" }),
        ipAddress: "203.0.113.45",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    ];

    await db.insert(auditLogs).values(sampleAuditLogs);
    console.log(`✅ Created ${sampleAuditLogs.length} audit log entries`);

    // Update summary
    console.log("\n📊 Updated Data Summary:");
    console.log(`- ${seedUsers.length} users created`);
    console.log(`- ${seedCategories.length} room categories created`);
    console.log(`- ${seedRooms.length} rooms created`);
    console.log(`- ${sampleBookings.length} sample bookings created`);
    console.log(`- ${insertedFoodCategories.length} food categories created`);
    console.log(`- ${insertedFoodItems.length} food items created`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("✅ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding process failed:", error);
    process.exit(1);
  });
