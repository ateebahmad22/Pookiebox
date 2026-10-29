import fs from 'fs';
import path from 'path';
import { Product, Order, BirthdayEntry, EmailLog, User, CustomGiftBox } from '../src/types.ts';
import { INITIAL_PRODUCTS, SAMPLE_COUPONS } from '../src/data/catalog.ts';

const DB_FILE = path.resolve(process.cwd(), 'data', 'pookiebox_db.json');

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  birthdays: BirthdayEntry[];
  coupons: typeof SAMPLE_COUPONS;
  emailLogs: EmailLog[];
  savedGiftBoxes: CustomGiftBox[];
  wishlists: { userId: string; productIds: string[] }[];
}

function getInitialData(): DatabaseSchema {
  return {
    users: [
      {
        id: 'user-demo-1',
        email: 'ateebahmad298@gmail.com',
        name: 'Ateeb Ahmad',
        role: 'user',
        phone: '+91 98765 43210',
        addresses: [
          {
            address: 'Flat 402, Rose Petal Court, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400050',
            instructions: 'Ring bell twice and leave at doorstep.',
          },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-admin-1',
        email: 'admin@pookiebox.love',
        name: 'Pookie Admin 🎀',
        role: 'admin',
        phone: '+91 99999 00000',
        addresses: [],
        createdAt: new Date().toISOString(),
      },
    ],
    products: INITIAL_PRODUCTS,
    orders: [
      {
        id: 'ord-sample-1',
        orderNumber: 'PB-2026-8821',
        userId: 'user-demo-1',
        customer: {
          fullName: 'Ateeb Ahmad',
          email: 'ateebahmad298@gmail.com',
          phone: '+91 98765 43210',
        },
        delivery: {
          address: 'Flat 402, Rose Petal Court, Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400050',
          instructions: 'Leave with doorman if not home',
          requestedDate: '2026-11-05',
        },
        giftInfo: {
          recipientName: 'My Sweet Angel',
          personalizedMessage: 'Happy Birthday my favorite human! May your day be as sweet and magical as you are. 💖',
          giftWrappingPreference: 'French Silk & Fairy Lights',
        },
        items: [
          {
            id: 'item-box-1',
            name: 'Custom Pink Heart Whisper Box',
            type: 'custom_box',
            price: 2746,
            quantity: 1,
            total: 2746,
            image: '/src/assets/images/hero_pookiebox_banner_1793289141255.jpg',
            customBoxSnapshot: {
              boxName: 'Pink Heart Whisper Box',
              boxColor: '#FFB6C1',
              ribbonColor: '#C45A7A',
              ribbonStyle: 'Classic Satin Double Bow',
              recipientName: 'My Sweet Angel',
              personalizedMessage: 'Happy Birthday my favorite human! May your day be as sweet and magical as you are. 💖',
              items: [
                { name: 'Buttercup Velvet Bow Teddy', quantity: 1, price: 799 },
                { name: 'Maison L’Amour Ruby Chocolates', quantity: 1, price: 649 },
                { name: 'Dainty Rose Gold Bow & Pearl Necklace', quantity: 1, price: 1299 },
              ],
            },
          },
        ],
        subtotal: 2746,
        shipping: 0,
        discount: 275,
        couponCode: 'POOKIE10',
        total: 2471,
        payment: {
          method: 'razorpay',
          status: 'completed',
          razorpayPaymentId: 'pay_sample_test99281',
          paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isTestMode: true,
        },
        status: 'confirmed',
        statusHistory: [
          { status: 'pending_payment', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'Order placed by customer' },
          { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 2 + 120000).toISOString(), note: 'Payment verified via Razorpay Sandbox' },
        ],
        tracking: {
          trackingNumber: 'BLUEDART-PB-882199',
          courier: 'BlueDart Express',
          estimatedDelivery: '2026-11-04',
        },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2 + 120000).toISOString(),
      },
    ],
    birthdays: [
      {
        id: 'bday-1',
        userId: 'user-demo-1',
        recipientName: 'Ananya Sharma',
        date: '2026-11-14',
        relationship: 'Best Friend',
        email: 'ananya.cute@example.com',
        favoriteCategories: ['plushies', 'chocolates', 'jewellery'],
        budget: 2500,
        reminderDays: [7, 3, 1, 0],
        notes: 'Loves soft plushies and dark ruby chocolates. Fav color is baby pink!',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bday-2',
        userId: 'user-demo-1',
        recipientName: 'Priya (Sister)',
        date: '2026-12-02',
        relationship: 'Sister',
        email: 'priya.s@example.com',
        favoriteCategories: ['stationery', 'flowers'],
        budget: 1500,
        reminderDays: [7, 1],
        notes: 'Studying for exams, wants pretty pastel journals and dried roses.',
        createdAt: new Date().toISOString(),
      },
    ],
    coupons: SAMPLE_COUPONS,
    emailLogs: [
      {
        id: 'email-sample-1',
        orderId: 'ord-sample-1',
        recipient: 'ateebahmad298@gmail.com',
        subject: 'Yay! Your PookieBox order is confirmed! 💗',
        type: 'payment_confirmed',
        sentAt: new Date(Date.now() - 86400000 * 2 + 120000).toISOString(),
        status: 'delivered',
        htmlPreview: 'Your order #PB-2026-8821 has been successfully placed and payment verified! Our fairy packaging team is preparing your custom box with ribbons and love.',
      },
    ],
    savedGiftBoxes: [],
    wishlists: [
      {
        userId: 'user-demo-1',
        productIds: ['prod-jewel-1', 'prod-teddy-1'],
      },
    ],
  };
}

export function loadDb(): DatabaseSchema {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using memory fallback:', err);
    return getInitialData();
  }
}

export function saveDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}
