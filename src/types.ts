export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number; // in INR
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  tags: string[];
  inStock: boolean;
  featured: boolean;
  bestseller?: boolean;
  dimensions?: string;
  badge?: string;
  // 3D representation hints for inside the box
  modelShape?: 'teddy' | 'chocolate' | 'jewellery' | 'flower' | 'stationery' | 'perfume' | 'gift_card';
  colorHint?: string;
}

export interface BoxStyle {
  id: string;
  name: string;
  boxColor: string;
  lidColor: string;
  ribbonDefaultColor: string;
  price: number;
  description: string;
}

export interface RibbonStyle {
  id: string;
  name: string;
  style: 'satin_bow' | 'butterfly_bow' | 'minimalist_knot' | 'rosette';
  extraPrice: number;
}

export interface WrappingStyle {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface CustomGiftBoxItem {
  product: Product;
  quantity: number;
}

export interface GreetingCardDesign {
  id: string;
  occasion: 'birthday' | 'anniversary' | 'love' | 'friendship' | 'congrats';
  title: string;
  backgroundStyle: 'pink-ribbon' | 'lavender-clouds' | 'vintage-cream' | 'sparkle-stars' | 'rose-petals';
  fontFamily: 'serif' | 'script' | 'modern';
  primaryMessage: string;
  signOff: string;
  stickers: string[];
  photoUrl?: string;
  createdAt: string;
}

export interface CustomGiftBox {
  id: string;
  name: string;
  boxStyleId: string;
  boxColor: string;
  ribbonColor: string;
  ribbonStyle: RibbonStyle['style'];
  wrappingStyleId: string;
  items: CustomGiftBoxItem[];
  recipientName: string;
  personalizedMessage: string;
  greetingCard?: GreetingCardDesign;
  boxPrice: number;
  itemsPrice: number;
  wrappingPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface GiftLink {
  id: string;
  token: string;
  orderId?: string;
  senderName: string;
  senderEmail?: string;
  recipientName: string;
  message: string;
  greetingCard?: GreetingCardDesign;
  photos?: string[];
  boxSnapshot?: any;
  digitalGiftType?: string;
  digitalGiftCode?: string;
  isRevoked: boolean;
  openedAt?: string;
  createdAt: string;
}

export interface CoupleMilestone {
  id: string;
  title: string;
  date: string;
  note: string;
  category: 'anniversary' | 'first_date' | 'trip' | 'proposal' | 'special';
}

export interface CoupleWishlistItem {
  id: string;
  title: string;
  budget?: number;
  notes?: string;
  productId?: string;
  addedBy: string;
  createdAt: string;
}

export interface CoupleLoveNote {
  id: string;
  message: string;
  date: string;
  from: string;
}

export interface CoupleSpace {
  userId: string;
  partnerName: string;
  anniversaryDate: string; // YYYY-MM-DD
  relationshipType: string;
  milestones: CoupleMilestone[];
  wishlist: CoupleWishlistItem[];
  loveNotes: CoupleLoveNote[];
  updatedAt: string;
}

export interface ReferralHistoryItem {
  id: string;
  referredName: string;
  date: string;
  reward: number;
  status: 'credited' | 'pending';
}

export interface ReferralProfile {
  userId: string;
  code: string;
  creditsEarned: number;
  creditsAvailable: number;
  totalInvited: number;
  history: ReferralHistoryItem[];
}

export interface CartItem {
  id: string; // unique item cart key
  type: 'product' | 'custom_box';
  product?: Product;
  customBox?: CustomGiftBox;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryDetails {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  instructions?: string;
  requestedDate?: string;
}

export interface GiftInformation {
  recipientName: string;
  personalizedMessage: string;
  giftWrappingPreference: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItemSnapshot {
  id: string;
  name: string;
  type: 'product' | 'custom_box';
  price: number;
  quantity: number;
  total: number;
  image?: string;
  customBoxSnapshot?: {
    boxName: string;
    boxColor: string;
    ribbonColor: string;
    ribbonStyle: string;
    recipientName: string;
    personalizedMessage: string;
    greetingCard?: GreetingCardDesign;
    items: { name: string; quantity: number; price: number }[];
  };
  digitalGiftCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer: CustomerDetails;
  delivery: DeliveryDetails;
  giftInfo: GiftInformation;
  items: OrderItemSnapshot[];
  giftLinkToken?: string;
  greetingCard?: GreetingCardDesign;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  payment: {
    method: 'razorpay' | 'cod' | 'test_sandbox';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
    isTestMode?: boolean;
  };
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  tracking?: {
    trackingNumber?: string;
    courier?: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayEntry {
  id: string;
  userId: string;
  recipientName: string;
  date: string; // YYYY-MM-DD
  relationship: string;
  email?: string;
  favoriteCategories: string[];
  budget: number;
  reminderDays: number[]; // e.g. [7, 3, 1, 0]
  notes?: string;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  orderId?: string;
  recipient: string;
  subject: string;
  type:
    | 'order_placed'
    | 'payment_confirmed'
    | 'order_shipped'
    | 'order_delivered'
    | 'order_cancelled'
    | 'birthday_reminder';
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  htmlPreview: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  addresses: DeliveryDetails[];
  createdAt: string;
}
