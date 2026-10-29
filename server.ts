import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { loadDb, saveDb } from './server/db.ts';
import { sendOrderPlacedEmail, sendPaymentConfirmedEmail, sendOrderStatusEmail, sendBirthdayReminderEmail } from './server/emails.ts';
import { createRazorpayOrder, verifyRazorpaySignature } from './server/razorpay.ts';
import { Product, Order, OrderStatus, GiftLink, CoupleSpace, ReferralProfile, GreetingCardDesign, CustomGiftBox } from './src/types.ts';
import { BOX_STYLES, RIBBON_STYLES, RIBBON_COLORS, WRAPPING_STYLES } from './src/data/catalog.ts';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
try {
  aiClient = new GoogleGenAI({});
} catch (e) {
  console.warn('GoogleGenAI initialization skipped or pending key:', e);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Server-side cart calculation helper
function calculateCartTotals(
  items: any[],
  couponCode?: string
): { subtotal: number; discount: number; shipping: number; total: number; validCoupon?: any } {
  const db = loadDb();
  let subtotal = 0;

  for (const item of items) {
    if (item.type === 'product') {
      const prod = db.products.find((p) => p.id === item.product?.id || p.id === item.id);
      const price = prod ? prod.price : item.unitPrice || 0;
      subtotal += price * (item.quantity || 1);
    } else if (item.type === 'custom_box') {
      // Recalculate custom box: boxPrice + itemsPrice + wrappingPrice
      const box = item.customBox;
      let boxItemsPrice = 0;
      if (box && Array.isArray(box.items)) {
        for (const bi of box.items) {
          const prod = db.products.find((p) => p.id === bi.product?.id);
          const pPrice = prod ? prod.price : bi.product?.price || 0;
          boxItemsPrice += pPrice * (bi.quantity || 1);
        }
      }
      const boxBasePrice = box?.boxPrice || 199;
      const wrappingPrice = box?.wrappingPrice || 49;
      const boxTotal = boxBasePrice + boxItemsPrice + wrappingPrice;
      subtotal += boxTotal * (item.quantity || 1);
    }
  }

  // Calculate discount
  let discount = 0;
  let validCoupon = null;
  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (coupon) {
      if (subtotal >= coupon.minOrder) {
        if (coupon.discountPercent) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
        } else if (coupon.discountAmount) {
          discount = Math.min(coupon.discountAmount, subtotal);
        }
        validCoupon = coupon;
      }
    }
  }

  // Shipping policy: Free above ₹999, else ₹99
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total, validCoupon };
}

// ----------------- API ROUTES -----------------

// 1. Products
app.get('/api/products', (req, res) => {
  const db = loadDb();
  let list = [...db.products];
  const { category, search, sort } = req.query;

  if (category && category !== 'all') {
    list = list.filter((p) => p.categorySlug === category || p.category.toLowerCase().includes(String(category).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  res.json({ products: list });
});

app.get('/api/products/:id', (req, res) => {
  const db = loadDb();
  const prod = db.products.find((p) => p.id === req.params.id || p.slug === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: prod });
});

// 2. Validate Cart & Coupons
app.post('/api/cart/calculate', (req, res) => {
  const { items, couponCode } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }
  const calc = calculateCartTotals(items, couponCode);
  res.json(calc);
});

app.get('/api/coupons/validate', (req, res) => {
  const db = loadDb();
  const code = String(req.query.code || '').trim().toUpperCase();
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code);
  if (!coupon) return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
  res.json({ valid: true, coupon });
});

// 3. Orders & Checkout
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, delivery, giftInfo, items, couponCode, paymentMethod } = req.body;
    if (!customer?.email || !items || !items.length) {
      return res.status(400).json({ error: 'Invalid order parameters' });
    }

    const db = loadDb();
    // Server-verified calculation
    const calc = calculateCartTotals(items, couponCode);

    const orderNumber = `PB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Build immutable item snapshots
    const itemSnapshots = items.map((item: any, idx: number) => {
      if (item.type === 'custom_box') {
        const box = item.customBox;
        return {
          id: `item-snap-${idx}`,
          name: box?.name || 'Custom Surprise Box',
          type: 'custom_box' as const,
          price: box?.totalPrice || item.unitPrice || 0,
          quantity: item.quantity || 1,
          total: (box?.totalPrice || item.unitPrice || 0) * (item.quantity || 1),
          image: '/src/assets/images/hero_pookiebox_banner_1793289141255.jpg',
          customBoxSnapshot: {
            boxName: box?.name || 'Custom Pookie Box',
            boxColor: box?.boxColor || '#FFB6C1',
            ribbonColor: box?.ribbonColor || '#C45A7A',
            ribbonStyle: box?.ribbonStyle || 'Classic Satin Double Bow',
            recipientName: box?.recipientName || giftInfo?.recipientName || customer.fullName,
            personalizedMessage: box?.personalizedMessage || giftInfo?.personalizedMessage || '',
            items: (box?.items || []).map((bi: any) => ({
              name: bi.product.name,
              quantity: bi.quantity,
              price: bi.product.price,
            })),
          },
        };
      }
      const prod = db.products.find((p) => p.id === (item.product?.id || item.id));
      return {
        id: `item-snap-${idx}`,
        name: prod?.name || item.name || 'Gift Item',
        type: 'product' as const,
        price: prod?.price || item.unitPrice || 0,
        quantity: item.quantity || 1,
        total: (prod?.price || item.unitPrice || 0) * (item.quantity || 1),
        image: prod?.image || item.image,
      };
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: req.body.userId || 'guest',
      customer,
      delivery: {
        address: delivery.address,
        city: delivery.city,
        state: delivery.state,
        pinCode: delivery.pinCode,
        instructions: delivery.instructions,
        requestedDate: delivery.requestedDate,
      },
      giftInfo: {
        recipientName: giftInfo?.recipientName || customer.fullName,
        personalizedMessage: giftInfo?.personalizedMessage || '',
        giftWrappingPreference: giftInfo?.giftWrappingPreference || 'Standard Bow Wrap',
      },
      items: itemSnapshots,
      subtotal: calc.subtotal,
      shipping: calc.shipping,
      discount: calc.discount,
      couponCode: calc.validCoupon ? couponCode : undefined,
      total: calc.total,
      payment: {
        method: paymentMethod || 'razorpay',
        status: 'pending',
      },
      status: 'pending_payment',
      statusHistory: [
        {
          status: 'pending_payment',
          timestamp: new Date().toISOString(),
          note: 'Order created, awaiting payment',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Initialize Razorpay payment order
    const rzpOrder = await createRazorpayOrder(calc.total, orderNumber);
    newOrder.payment.razorpayOrderId = rzpOrder.orderId;
    newOrder.payment.isTestMode = rzpOrder.isSandbox;

    db.orders.unshift(newOrder);
    saveDb(db);

    // Trigger Order Placed Email immediately
    await sendOrderPlacedEmail(newOrder);

    res.status(201).json({
      order: newOrder,
      razorpay: {
        orderId: rzpOrder.orderId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: rzpOrder.keyId,
        isSandbox: rzpOrder.isSandbox,
      },
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// 4. Verify Razorpay Payment
app.post('/api/orders/:id/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSandboxTest } = req.body;
    const db = loadDb();
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Verify signature
    const verification = verifyRazorpaySignature(
      razorpay_order_id || order.payment.razorpayOrderId || '',
      razorpay_payment_id || 'pay_test_' + Date.now(),
      razorpay_signature || ''
    );

    if (!verification.isValid && !isSandboxTest) {
      order.payment.status = 'failed';
      order.statusHistory.push({
        status: 'pending_payment',
        timestamp: new Date().toISOString(),
        note: 'Payment signature verification failed',
      });
      saveDb(db);
      return res.status(400).json({ error: 'Payment signature verification failed', order });
    }

    // Success! Update order
    order.payment.status = 'completed';
    order.payment.razorpayPaymentId = razorpay_payment_id || `pay_${verification.isSandbox ? 'sbx_' : ''}${Date.now()}`;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.paidAt = new Date().toISOString();
    order.payment.isTestMode = verification.isSandbox;
    order.status = 'confirmed';
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      note: `Payment verified (${verification.isSandbox ? 'Razorpay Sandbox Mode' : 'Live Razorpay API'}). Confirmed for preparation.`,
    });

    saveDb(db);

    // Trigger Payment Confirmation Email
    await sendPaymentConfirmedEmail(order);

    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
});

// 5. Query Orders
app.get('/api/orders', (req, res) => {
  const db = loadDb();
  const { email, userId } = req.query;
  let orders = db.orders;

  if (email) {
    orders = orders.filter((o) => o.customer.email.toLowerCase() === String(email).toLowerCase());
  } else if (userId && userId !== 'admin') {
    orders = orders.filter((o) => o.userId === userId);
  }

  res.json({ orders });
});

app.get('/api/orders/:id', (req, res) => {
  const db = loadDb();
  const order = db.orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order });
});

// 6. Admin: Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
  const { status, note, trackingNumber, courier } = req.body;
  const db = loadDb();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status as OrderStatus;
  order.updatedAt = new Date().toISOString();
  if (trackingNumber) {
    order.tracking = {
      trackingNumber,
      courier: courier || 'BlueDart Express',
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    };
  }

  order.statusHistory.push({
    status: status as OrderStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status}`,
  });

  saveDb(db);

  // Send status update notification email
  await sendOrderStatusEmail(order, status as OrderStatus, note);

  res.json({ success: true, order });
});

// 7. Birthdays
app.get('/api/birthdays', (req, res) => {
  const db = loadDb();
  const { userId } = req.query;
  const list = userId ? db.birthdays.filter((b) => b.userId === userId) : db.birthdays;
  res.json({ birthdays: list });
});

app.post('/api/birthdays', (req, res) => {
  const db = loadDb();
  const { recipientName, date, relationship, email, favoriteCategories, budget, reminderDays, notes, userId } = req.body;

  if (!recipientName || !date) {
    return res.status(400).json({ error: 'Name and birthday date are required' });
  }

  const newBirthday = {
    id: `bday-${Date.now()}`,
    userId: userId || 'user-demo-1',
    recipientName,
    date,
    relationship: relationship || 'Friend',
    email,
    favoriteCategories: favoriteCategories || ['plushies', 'chocolates'],
    budget: Number(budget) || 1500,
    reminderDays: reminderDays || [7, 3, 1, 0],
    notes,
    createdAt: new Date().toISOString(),
  };

  db.birthdays.unshift(newBirthday);
  saveDb(db);
  res.status(201).json({ birthday: newBirthday });
});

app.put('/api/birthdays/:id', (req, res) => {
  const db = loadDb();
  const idx = db.birthdays.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Birthday not found' });

  db.birthdays[idx] = { ...db.birthdays[idx], ...req.body };
  saveDb(db);
  res.json({ birthday: db.birthdays[idx] });
});

app.delete('/api/birthdays/:id', (req, res) => {
  const db = loadDb();
  db.birthdays = db.birthdays.filter((b) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/birthdays/:id/send-reminder', async (req, res) => {
  const db = loadDb();
  const bday = db.birthdays.find((b) => b.id === req.params.id);
  if (!bday) return res.status(404).json({ error: 'Birthday not found' });

  const targetEmail = req.body.email || 'ateebahmad298@gmail.com';
  const emailLog = await sendBirthdayReminderEmail(bday, targetEmail);
  res.json({ success: true, emailLog });
});

// 8. Wishlist
app.get('/api/wishlist', (req, res) => {
  const db = loadDb();
  const userId = String(req.query.userId || 'user-demo-1');
  const userWish = db.wishlists.find((w) => w.userId === userId);
  const productIds = userWish?.productIds || [];
  const products = db.products.filter((p) => productIds.includes(p.id));
  res.json({ productIds, products });
});

app.post('/api/wishlist/toggle', (req, res) => {
  const db = loadDb();
  const { userId = 'user-demo-1', productId } = req.body;
  let userWish = db.wishlists.find((w) => w.userId === userId);
  if (!userWish) {
    userWish = { userId, productIds: [] };
    db.wishlists.push(userWish);
  }

  const idx = userWish.productIds.indexOf(productId);
  if (idx > -1) {
    userWish.productIds.splice(idx, 1);
  } else {
    userWish.productIds.push(productId);
  }
  saveDb(db);
  res.json({ productIds: userWish.productIds });
});

// 9. Saved Gift Boxes
app.get('/api/saved-boxes', (req, res) => {
  const db = loadDb();
  res.json({ boxes: db.savedGiftBoxes });
});

app.post('/api/saved-boxes', (req, res) => {
  const db = loadDb();
  const newBox = {
    ...req.body,
    id: `box-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.savedGiftBoxes.unshift(newBox);
  saveDb(db);
  res.status(201).json({ box: newBox });
});

app.delete('/api/saved-boxes/:id', (req, res) => {
  const db = loadDb();
  db.savedGiftBoxes = db.savedGiftBoxes.filter((b) => b.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 10. Admin Endpoints
app.get('/api/admin/overview', (req, res) => {
  const db = loadDb();
  const totalRevenue = db.orders
    .filter((o) => o.payment.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = db.orders.filter((o) => o.status === 'pending_payment' || o.status === 'payment_processing').length;
  const confirmedOrders = db.orders.filter((o) => o.status === 'confirmed' || o.status === 'processing').length;
  const deliveredOrders = db.orders.filter((o) => o.status === 'delivered').length;

  res.json({
    totalRevenue,
    totalOrders: db.orders.length,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    recentOrders: db.orders.slice(0, 5),
    recentEmails: db.emailLogs.slice(0, 8),
    productsCount: db.products.length,
    birthdaysTracked: db.birthdays.length,
  });
});

app.get('/api/admin/email-logs', (req, res) => {
  const db = loadDb();
  res.json({ emails: db.emailLogs });
});

// Admin Product CRUD
app.post('/api/admin/products', (req, res) => {
  const db = loadDb();
  const newProd: Product = {
    ...req.body,
    id: `prod-${Date.now()}`,
    slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    rating: 5.0,
    reviewsCount: 1,
    inStock: true,
  };
  db.products.push(newProd);
  saveDb(db);
  res.status(201).json({ product: newProd });
});

app.put('/api/admin/products/:id', (req, res) => {
  const db = loadDb();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  saveDb(db);
  res.json({ product: db.products[idx] });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const db = loadDb();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 11. AI Gifting Stylist (Powered by Gemini API & Real Inventory)
app.post('/api/ai/gift-advisor', async (req, res) => {
  try {
    const { message, recipient, occasion, budget, vibe } = req.body;
    const db = loadDb();
    const catalogList = db.products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      tags: p.tags,
      inStock: p.inStock,
      description: p.description,
    }));

    let advisorReply = '';
    let recommendedProductIds: string[] = [];

    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are "Pookie AI Stylist", the sweet, thoughtful, coquette gifting concierge for PookieBox.
User query: "${message || 'Help me find the perfect gift!'}"
Context:
- Recipient: ${recipient || 'Special someone'}
- Occasion: ${occasion || 'Celebration / Just Because'}
- Budget: ${budget ? `₹${budget}` : 'Flexible'}
- Desired Vibe: ${vibe || 'Cute & Aesthetic'}

Current available products in our database:
${JSON.stringify(catalogList, null, 2)}

Instructions:
1. Speak in a warm, polite, aesthetic tone with delicate charm (no emojis, use words like sweet, magical, lovely, heartfelt).
2. Recommend 2 to 3 SPECIFIC products from the above list that fit the budget, recipient, and occasion.
3. NEVER make up products, prices, or inventory. Only use the listed items.
4. Output your response in valid JSON format with keys:
{
  "reply": "Your friendly coquette stylist message here with personal styling advice",
  "productIds": ["prod-id-1", "prod-id-2"]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);
        advisorReply = parsed.reply || '';
        recommendedProductIds = Array.isArray(parsed.productIds) ? parsed.productIds : [];
      } catch (geminiErr) {
        console.warn('Gemini API call error, applying smart local stylist fallback:', geminiErr);
      }
    }

    // Heuristic fallback if Gemini not configured or failed
    if (!advisorReply) {
      const q = (message || '').toLowerCase();
      let matched = db.products.filter(p => p.inStock);

      if (budget && Number(budget) > 0) {
        matched = matched.filter(p => p.price <= Number(budget));
      }

      if (q.includes('teddy') || q.includes('bear') || q.includes('plush')) {
        matched = matched.filter(p => p.categorySlug === 'plushies');
      } else if (q.includes('choco') || q.includes('sweet') || q.includes('treat')) {
        matched = matched.filter(p => p.categorySlug === 'chocolates');
      } else if (q.includes('jewel') || q.includes('necklace') || q.includes('ring')) {
        matched = matched.filter(p => p.categorySlug === 'jewellery');
      } else if (q.includes('flower') || q.includes('rose') || q.includes('bouquet')) {
        matched = matched.filter(p => p.categorySlug === 'flowers');
      } else if (q.includes('digital') || q.includes('card') || q.includes('virtual')) {
        matched = matched.filter(p => p.categorySlug === 'digital');
      }

      if (!matched.length) matched = db.products.filter(p => p.inStock);
      const chosen = matched.slice(0, 3);
      recommendedProductIds = chosen.map(p => p.id);

      advisorReply = `I have handpicked the sweetest ideas for ${recipient || 'your loved one'}! These delightful keepsakes match your aesthetic and budget beautifully. You can pack them directly into a 3D satin ribbon box or send them with a handwritten letter.`;
    }

    const recommendedProducts = db.products.filter(p => recommendedProductIds.includes(p.id));

    res.json({
      reply: advisorReply,
      recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : db.products.slice(0, 2),
    });
  } catch (err: any) {
    console.error('AI Advisor error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// 12. Surprise Me Algorithmic Curation
app.post('/api/gifts/surprise-me', (req, res) => {
  const { recipientName = 'My Special Pookie', occasion = 'Celebration', budget = 2500, vibe = 'romantic' } = req.body;
  const db = loadDb();

  // Pick suitable box style
  const availableBoxes = BOX_STYLES;
  const boxStyle = availableBoxes[Math.floor(Math.random() * availableBoxes.length)];
  const ribbonStyle = RIBBON_STYLES[Math.floor(Math.random() * RIBBON_STYLES.length)];
  const ribbonColor = RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)].hex;
  const wrapping = WRAPPING_STYLES[Math.floor(Math.random() * WRAPPING_STYLES.length)];

  const basePrice = boxStyle.price + ribbonStyle.extraPrice + wrapping.price;
  const remainingBudget = Math.max(300, Number(budget) - basePrice);

  // Filter in-stock physical products
  const candidates = db.products.filter(p => p.inStock && p.categorySlug !== 'digital');
  // Shuffle candidates
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());

  const selectedItems: any[] = [];
  let accumulatedPrice = 0;

  for (const prod of shuffled) {
    if (accumulatedPrice + prod.price <= remainingBudget && selectedItems.length < 3) {
      selectedItems.push({ product: prod, quantity: 1 });
      accumulatedPrice += prod.price;
    }
  }

  // Ensure at least one item
  if (selectedItems.length === 0 && shuffled.length > 0) {
    selectedItems.push({ product: shuffled[0], quantity: 1 });
    accumulatedPrice += shuffled[0].price;
  }

  const generatedBox: CustomGiftBox = {
    id: `box-surprise-${Date.now()}`,
    name: `Surprise ${occasion} Box for ${recipientName}`,
    boxStyleId: boxStyle.id,
    boxColor: boxStyle.boxColor,
    ribbonColor: ribbonColor,
    ribbonStyle: ribbonStyle.style,
    wrappingStyleId: wrapping.id,
    items: selectedItems,
    recipientName,
    personalizedMessage: `A delightful surprise curated with all my love for ${recipientName}! May this little box bring you endless smiles.`,
    boxPrice: boxStyle.price + ribbonStyle.extraPrice,
    itemsPrice: accumulatedPrice,
    wrappingPrice: wrapping.price,
    totalPrice: boxStyle.price + ribbonStyle.extraPrice + accumulatedPrice + wrapping.price,
    createdAt: new Date().toISOString(),
  };

  res.json({ box: generatedBox });
});

// 13. Digital Gift Opening Experience & Shareable Gift Links
app.post('/api/gift-links', (req, res) => {
  const { orderId, senderName, senderEmail, recipientName, message, greetingCard, photos, boxSnapshot, digitalGiftType, digitalGiftCode } = req.body;
  const db = loadDb();

  const token = `gift-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString(36).slice(-4)}`;
  const newLink: GiftLink = {
    id: `glink-${Date.now()}`,
    token,
    orderId,
    senderName: senderName || 'Someone Special',
    senderEmail,
    recipientName: recipientName || 'Precious One',
    message: message || 'A sweet surprise sent straight from the heart!',
    greetingCard,
    photos: Array.isArray(photos) ? photos : [],
    boxSnapshot,
    digitalGiftType,
    digitalGiftCode,
    isRevoked: false,
    createdAt: new Date().toISOString(),
  };

  db.giftLinks.unshift(newLink);

  // If orderId is supplied, also attach token to the order
  if (orderId) {
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
      order.giftLinkToken = token;
      if (greetingCard) order.greetingCard = greetingCard;
    }
  }

  saveDb(db);
  res.status(201).json({ giftLink: newLink });
});

app.get('/api/gift-links/:token', (req, res) => {
  const db = loadDb();
  const link = db.giftLinks.find(g => g.token === req.params.token);
  if (!link) {
    return res.status(404).json({ error: 'Gift link not found' });
  }

  if (link.isRevoked) {
    return res.status(403).json({ error: 'This gift link has been revoked by the sender.', isRevoked: true });
  }

  // Mark openedAt timestamp
  if (!link.openedAt) {
    link.openedAt = new Date().toISOString();
    saveDb(db);
  }

  res.json({ giftLink: link });
});

app.post('/api/gift-links/:id/revoke', (req, res) => {
  const db = loadDb();
  const link = db.giftLinks.find(g => g.id === req.params.id || g.token === req.params.id);
  if (!link) {
    return res.status(404).json({ error: 'Gift link not found' });
  }
  link.isRevoked = true;
  saveDb(db);
  res.json({ success: true, message: 'Gift link revoked successfully' });
});

// 14. Couple Mode (Private Authenticated Space)
app.get('/api/couple-space', (req, res) => {
  const db = loadDb();
  const userId = String(req.query.userId || 'user-demo-1');
  let space = db.coupleSpaces.find(c => c.userId === userId);

  if (!space) {
    space = {
      userId,
      partnerName: 'My Beloved',
      anniversaryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      relationshipType: 'Partner in Crime',
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          title: 'The Day We Met',
          date: '2025-01-14',
          note: 'Our very first coffee date where time stood still.',
          category: 'first_date',
        },
      ],
      wishlist: [],
      loveNotes: [
        {
          id: `note-${Date.now()}-1`,
          message: 'Welcome to our private corner! Drop hints, save memories, and plan surprises.',
          date: new Date().toISOString().split('T')[0],
          from: 'PookieBox',
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    db.coupleSpaces.push(space);
    saveDb(db);
  }

  res.json({ space });
});

app.post('/api/couple-space', (req, res) => {
  const db = loadDb();
  const { userId = 'user-demo-1', partnerName, anniversaryDate, relationshipType } = req.body;
  let space = db.coupleSpaces.find(c => c.userId === userId);

  if (!space) {
    space = {
      userId,
      partnerName: partnerName || 'My Beloved',
      anniversaryDate: anniversaryDate || '2026-12-31',
      relationshipType: relationshipType || 'Soulmate',
      milestones: [],
      wishlist: [],
      loveNotes: [],
      updatedAt: new Date().toISOString(),
    };
    db.coupleSpaces.push(space);
  } else {
    if (partnerName) space.partnerName = partnerName;
    if (anniversaryDate) space.anniversaryDate = anniversaryDate;
    if (relationshipType) space.relationshipType = relationshipType;
    space.updatedAt = new Date().toISOString();
  }

  saveDb(db);
  res.json({ space });
});

app.post('/api/couple-space/milestone', (req, res) => {
  const db = loadDb();
  const { userId = 'user-demo-1', title, date, note, category = 'special' } = req.body;
  let space = db.coupleSpaces.find(c => c.userId === userId);
  if (!space) return res.status(404).json({ error: 'Couple space not found' });

  const milestone = {
    id: `ms-${Date.now()}`,
    title,
    date,
    note: note || '',
    category,
  };

  space.milestones.unshift(milestone);
  space.updatedAt = new Date().toISOString();
  saveDb(db);
  res.status(201).json({ milestone, space });
});

app.delete('/api/couple-space/milestone/:id', (req, res) => {
  const db = loadDb();
  const userId = String(req.query.userId || 'user-demo-1');
  const space = db.coupleSpaces.find(c => c.userId === userId);
  if (space) {
    space.milestones = space.milestones.filter(m => m.id !== req.params.id);
    saveDb(db);
  }
  res.json({ success: true });
});

app.post('/api/couple-space/wishlist', (req, res) => {
  const db = loadDb();
  const { userId = 'user-demo-1', title, budget, notes, productId, addedBy = 'Me' } = req.body;
  let space = db.coupleSpaces.find(c => c.userId === userId);
  if (!space) return res.status(404).json({ error: 'Couple space not found' });

  const item = {
    id: `cwish-${Date.now()}`,
    title,
    budget: Number(budget) || 0,
    notes: notes || '',
    productId,
    addedBy,
    createdAt: new Date().toISOString(),
  };

  space.wishlist.unshift(item);
  space.updatedAt = new Date().toISOString();
  saveDb(db);
  res.status(201).json({ item, space });
});

app.post('/api/couple-space/note', (req, res) => {
  const db = loadDb();
  const { userId = 'user-demo-1', message, from = 'Me' } = req.body;
  let space = db.coupleSpaces.find(c => c.userId === userId);
  if (!space) return res.status(404).json({ error: 'Couple space not found' });

  const note = {
    id: `note-${Date.now()}`,
    message,
    date: new Date().toISOString().split('T')[0],
    from,
  };

  space.loveNotes.unshift(note);
  space.updatedAt = new Date().toISOString();
  saveDb(db);
  res.status(201).json({ note, space });
});

// 15. Refer and Earn Program
app.get('/api/referrals', (req, res) => {
  const db = loadDb();
  const userId = String(req.query.userId || 'user-demo-1');
  let ref = db.referrals.find(r => r.userId === userId);

  if (!ref) {
    const code = `POOKIE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    ref = {
      userId,
      code,
      creditsEarned: 0,
      creditsAvailable: 0,
      totalInvited: 0,
      history: [],
    };
    db.referrals.push(ref);
    saveDb(db);
  }

  res.json({ referral: ref });
});

app.post('/api/referrals/apply', (req, res) => {
  const { code, currentUserId = 'user-demo-1' } = req.body;
  const db = loadDb();
  const cleanCode = String(code || '').trim().toUpperCase();

  const ref = db.referrals.find(r => r.code === cleanCode);
  if (!ref) {
    return res.status(404).json({ valid: false, message: 'Invalid referral code.' });
  }

  if (ref.userId === currentUserId) {
    return res.status(400).json({ valid: false, message: 'You cannot use your own referral code!' });
  }

  res.json({
    valid: true,
    discountAmount: 150,
    message: 'Referral code applied! You get ₹150 off on this order.',
  });
});

// 16. Greeting Card Templates
app.get('/api/card-templates', (req, res) => {
  const db = loadDb();
  res.json({ templates: db.cardTemplates });
});

// 17. Admin Extra Endpoints
app.get('/api/admin/gift-links', (req, res) => {
  const db = loadDb();
  res.json({ giftLinks: db.giftLinks });
});

app.get('/api/admin/referrals', (req, res) => {
  const db = loadDb();
  res.json({ referrals: db.referrals });
});

// ----------------- VITE MIDDLEWARE SETUP -----------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🌸 PookieBox server running on port ${PORT} [${isDev ? 'dev' : 'production'}]`);
  });
}

startServer();
