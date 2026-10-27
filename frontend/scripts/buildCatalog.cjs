const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const mockDataPath = path.join(__dirname, '..', 'src', 'services', 'mockData.js');

// Custom curated naming dictionaries for the numbered image files
const tryOnCapsNames = [
  'Heritage Wool Felt Snapback Cap',
  'Vintage Washed Navy Dad Cap',
  'Retro Corduroy 5-Panel Cap',
  'Streetwear Embroidered Trucker Hat',
  'Performance Breathable Running Cap',
  'Classic 6-Panel Distressed Baseball Cap',
  'Urban Camo Flat Brim Snapback',
  'Raw Denim Minimalist Curve-Brim Hat',
  'Suede Brim Athletic Dad Cap',
  'Monochrome Canvas Street Cap',
  'Embroidered Floral Crest Baseball Cap',
  'Chambray Summer Visor Sun Cap',
  'Midnight Black Tactical Strapback',
  'Vintage Washed Khaki Baseball Cap',
  'Waffle Knit Brimmed Street Cap',
  'Essential Low-Profile Cotton Cap',
];

const tryOnPantsNames = [
  'Relaxed Pleated Wool Flannel Trousers',
  'Classic Italian Slim-Fit Chinos',
  'Urban Utility Tapered Cargo Pants',
  'Tailored High-Waist Linen Slacks',
  'Classic Khaki Straight-Leg Chinos',
  'Vintage Washed Olive Cargo Joggers',
  'Wide-Leg Japanese Twill Trousers',
  'Crop Tapered Smart Business Pants',
  'Drawstring Stretch Cotton Lounge Trousers',
  'Midnight Navy Tailored Dress Pants',
  'Chambray Pleated Easy Trousers',
  'Brushed Cotton Minimalist Trousers',
  'All-Day Flex Slim Tailored Pants',
];

const tryOnShirtsNames = [
  'Crisp Poplin Button-Down Relaxed Shirt',
  'Vintage Sunburst Acid Wash Graphic Tee',
  'Camp Collar Textured Summer Shirt',
  'Heavyweight Organic Cotton Boxy Tee',
  'Indigo Chambray Workwear Over-Shirt',
  'Classic Breton Striped Nautical Top',
  'Retro Typography Heavy Jersey Tee',
  'Drop-Shoulder Linen-Blend Camp Shirt',
  'Mineral Washed Distressed Crewneck',
  'Pinstripe Tailored Casual Shirt',
  'Sateen Finish Resort Short-Sleeve Top',
  'Minimalist Pocket Slub Cotton Tee',
  'Classic White Heavyweight Essential Tee',
];

const womenAccessoriesNames = [
  'Artisan Kundan Choker & Pearl Drops Set',
  'Handcrafted Meenakari Enamel Jhumkas',
  'Sculptural Dual-Tone Gold Hoop Earrings',
  'Embroidered Velvet Zardozi Bridal Potli',
  'Italian Pebble-Leather Structured Tote Bag',
  'Vintage Tortoiseshell Cat-Eye Sunglasses',
  'Rose-Gold Textured Statement Cuff Bangle',
  'Bohemian Freshwater Pearl Layered Choker',
  'Sleek Metallic Envelope Party Clutch',
  'Floral Filigree Antique Gold Necklace',
  'Burgundy Suede Crossbody Saddle Bag',
  'Geometric Crystal Drop Evening Earrings',
  'Hand-Woven Silk Jacquard Stole & Brooch',
  'Minimalist Chunky Curb Chain Bracelet',
  'Champagne Satin Pleated Knot Clutch',
  'Emerald Green Polki Stone Drop Earrings',
  'Leather Micro-Bucket Crossbody Bag',
  'Cubic Zirconia Tennis Bracelet Set',
  'Mother-of-Pearl Dial Mesh Strap Watch',
  'Temple Architecture Matte Gold Bangle Pair',
  'Classic Black Quilted Chain Shoulder Bag',
];

const menAccessoriesNames = [
  'Hand-Stitched Italian Leather Reversible Belt',
  'Brushed Gunmetal Minimalist Chrono Watch',
  'Octovue Polarized UV400 Aviator Sunglasses',
  'Vintage Tortoise-Shell Square Acetate Sunglasses',
  'Full-Grain Leather Bifold Cardholder Wallet',
  'Matte Black Engraved Cufflinks & Tie Bar Set',
  'Woven Leather Braided Wristband with Silver Clasp',
  'Urban Canvas Utility Crossbody Messenger Pouch',
  'Heritage Pebble-Grain Leather Passport Folio',
  'Artisan Burnished Brass Buckle Leather Belt',
];

const menFormalNames = [
  'Bespoke Midnight Black Wool Tuxedo Blazer',
  'Royal Wine Tailored Cotton Sateen Dress Shirt',
  'Earth Brown Fine Merino Wool Formal Blazer',
  'Slim-Fit Charcoal Executive Suit Ensemble',
  'Classic Oxford Sky-Blue Herringbone Formal Shirt',
  'Crisp Egyptian Cotton French Cuff Formal Shirt',
  'Two-Piece Navy Slim-Fit Tailored Business Suit',
  'Textured Pastel Lilac Smart Business Shirt',
];

const menTraditionalNames = [
  'Embroidered Silk Blend Festive Kurta Ensemble',
  'Handcrafted Threadwork Jacquard Sherwani',
  'Royal Bandhgala Festive Suit with Pocket Square',
  'Chikankari Lucknowi Pastel Silk Kurta Set',
  'Heritage Brocade Nehru Jacket with Mandarin Collar',
  'Ivory Cream Woven Tussar Silk Celebration Kurta',
  'Raw Silk Saffron Festive Kurta Pajama Set',
];

const menTshirtSummerNames = [
  'Washed Mineral Grey Drop-Shoulder Summer Tee',
  'Coastal Breeze Breathable Organic Cotton Tee',
  'Urban Art Graphic Heavyweight Crewneck T-Shirt',
  'Sunset Coral Relaxed Fit Everyday Tee',
  'Classic Jet Black Bio-Wash Cotton Crew Tee',
  'Minimalist Sage Green Textured Slub Tee',
  'Vintage Typography Acid-Wash Summer Tee',
  'Sun-Soaked Palm Graphic Resort T-Shirt',
];

const summerWomenDressNames = [
  'Floral Print Tiered Chiffon Maxi Sundress',
  'Sunburst Yellow Sleeveless Smocked Midi Dress',
  'Breezy Pastel Bohemian Summer Swing Dress',
  'Vintage Polka Dot Flounce Summer Wrap Dress',
  'Botanical Applique Linen-Blend Sun Dress',
  'Crisp Cotton Poplin Belted Shirt Dress',
  'Golden Hour Satin Slip Cocktail Sundress',
  'Island Escape Tropical Print Wrap Midi Dress',
];

const womenFormalNames = [
  'Asymmetrical Tailored Cobalt Co-ord Set',
  'Double-Breasted Ivory Peak-Lapel Blazer',
  'Blush Pink Structured Executive Midi Dress',
  'Sky Blue Belted Tailored Workwear Dress',
];

const womenTraditionalNames = [
  'Embroidered Royal Scarlet Anarkali Gown',
  'Banarasi Kanjeevaram Silk Woven Saree',
  'Zardozi Hand-Embroidered Velvet Kurti Set',
  'Heritage Brocade Georgette Sharara Suit',
  'Chanderi Silk Flared Festive Anarkali Set',
  'Mirror-Work Pastel Peach Lehenga Choli',
  'Hand-Block Printed Mulmul Festive Kurta Set',
  'Timeless Royal Blue Silk Saree with Zari Border',
  'Artisan Crafted Festive Patola Silk Kurta Ensemble',
];

const womenTshirtsNames = [
  'Navy Blue Relaxed Fit Cotton Crewneck Tee',
  'Ribbed Scoop-Neck Essential Casual Tee',
  'Graphic Botanical Print Drop-Shoulder Tee',
  'Pastel Striped French Terry Boxy Tee',
  'Lavender Dreams Soft Bio-Wash Tee',
  'Minimalist Monochrome Boyfriend T-Shirt',
  'Sun-Kissed Yellow Cropped Graphic Tee',
  'Pure White Classic Everyday Cotton Tee',
  'Lover Slogan Heavyweight Oversized Black Tee',
];

const womenWinterNames = [
  'Midnight Black Double-Breasted Wool Trench Coat',
  'Cream Sherpa-Lined Teddy Fleece Winter Jacket',
  'Charcoal Ribbed Turtleneck Cashmere Knit Sweater',
  'Oatmeal Melange Longline Wool Cardigan',
  'Blush Pink Insulated Quilted Puffer Jacket',
  'French Alpine Houndstooth Belted Overcoat',
  'Tailored Camel Wool Wrap Coat with Storm Flap',
];

// Helper to sanitize title
function formatTitle(folder, fileName, index) {
  switch (folder) {
    case 'men accessories':
      return menAccessoriesNames[index] || `Men Artisan Leather Accessory #${index + 1}`;
    case 'men formal':
      return menFormalNames[index] || `Men Executive Tailored Apparel #${index + 1}`;
    case 'men traditional':
      return menTraditionalNames[index] || `Men Handcrafted Festive Ethnic Wear #${index + 1}`;
    case 'men tshirt summer':
      return menTshirtSummerNames[index] || `Men Breathable Summer Tee #${index + 1}`;
    case 'summer women dress':
      return summerWomenDressNames[index] || `Women Breezy Summer Sundress #${index + 1}`;
    case 'try on caps':
      return tryOnCapsNames[index] || `Urban Streetwear Structured Cap #${index + 1}`;
    case 'try on pants':
      return tryOnPantsNames[index] || `Tailored Fit Everyday Trousers #${index + 1}`;
    case 'try on shirts':
      return tryOnShirtsNames[index] || `Relaxed Fit Cotton Shirt #${index + 1}`;
    case 'women accessories':
      return womenAccessoriesNames[index] || `Women Artisan Fine Jewelry #${index + 1}`;
    case 'women formal':
      return womenFormalNames[index] || `Women Modern Executive Workwear #${index + 1}`;
    case 'women tarditional dress':
      return womenTraditionalNames[index] || `Women Heritage Festive Ethnic Gown #${index + 1}`;
    case 'women tshirts':
      return womenTshirtsNames[index] || `Women Pure Cotton Everyday Tee #${index + 1}`;
    case 'women winter':
      return womenWinterNames[index] || `Women Insulated Luxury Winter Coat #${index + 1}`;
    default:
      return `StyleStack Designer Apparel #${index + 1}`;
  }
}

function getFolderConfig(folder, index) {
  switch (folder) {
    case 'men accessories':
      return {
        category: 'accessories',
        categoryName: 'Accessories',
        gender: 'men',
        season: 'all-season',
        style: 'luxury',
        sizes: ['Free Size'],
        basePrice: 999 + (index * 130) % 1500,
        discount: 20 + (index * 5) % 30,
        tags: ['men', 'accessories', 'leather', 'sunglasses', 'wallet', 'watch', 'belt', 'luxury'],
        description: 'Meticulously crafted men\'s fashion accessory built with durable materials, ergonomic contours, and refined styling for everyday elevation.',
      };
    case 'men formal':
      return {
        category: 'formal',
        categoryName: 'Formals',
        gender: 'men',
        season: 'all-season',
        style: 'formal',
        sizes: ['38', '40', '42', '44'],
        basePrice: 2499 + (index * 350) % 3000,
        discount: 15 + (index * 5) % 25,
        tags: ['men', 'formal', 'blazer', 'suit', 'shirt', 'executive', 'office', 'wedding'],
        description: 'Impeccably tailored men\'s formal wear crafted with structured shoulders, high-density breathability, and sharp European silhouettes.',
      };
    case 'men traditional':
      return {
        category: 'traditional',
        categoryName: 'Festive / Traditional',
        gender: 'men',
        season: 'festive',
        style: 'ethnic',
        sizes: ['S', 'M', 'L', 'XL'],
        basePrice: 2999 + (index * 450) % 3500,
        discount: 20 + (index * 5) % 25,
        tags: ['men', 'traditional', 'kurta', 'sherwani', 'festive', 'ethnic', 'wedding', 'nehru jacket'],
        description: 'Celebratory Indian ethnic wear featuring authentic thread embroidery, royal collar detailing, and rich heritage textures for ceremonies and festivities.',
      };
    case 'men tshirt summer':
      return {
        category: 'men-tshirts',
        categoryName: 'Men T-Shirts',
        gender: 'men',
        season: 'summer',
        style: 'casual',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        basePrice: 799 + (index * 90) % 700,
        discount: 25 + (index * 5) % 25,
        tags: ['men', 'men-tshirts', 'tshirt', 'summer', 'casual', 'crewneck', 'cotton', 'oversized'],
        description: 'Ultra-breathable 100% bio-washed cotton summer t-shirt tailored with pre-shrunk fabric, reinforced collar ribbing, and effortless drape.',
      };
    case 'summer women dress':
      return {
        category: 'casual',
        categoryName: 'Casual / Summer',
        gender: 'women',
        season: 'summer',
        style: 'casual',
        sizes: ['XS', 'S', 'M', 'L'],
        basePrice: 1799 + (index * 220) % 1700,
        discount: 20 + (index * 5) % 30,
        tags: ['women', 'casual', 'dress', 'summer', 'sundress', 'maxi', 'midi', 'floral', 'resort'],
        description: 'Lightweight breezy summer dress with delicate pleating, flattering waist cinch, and vibrant prints designed for beach escapes and weekend brunches.',
      };
    case 'try on caps':
      return {
        category: 'accessories',
        categoryName: 'Accessories',
        gender: index % 3 === 0 ? 'men' : index % 3 === 1 ? 'women' : 'unisex',
        season: 'all-season',
        style: 'streetwear',
        sizes: ['Free Size'],
        basePrice: 699 + (index * 80) % 1000,
        discount: 20 + (index * 5) % 25,
        tags: ['accessories', 'cap', 'hat', 'streetwear', 'snapback', 'headwear', 'dad hat', 'trucker'],
        description: 'Premium structured headwear engineered with reinforced 6-panel canvas, breathable embroidered eyelets, and adjustable precision closure.',
      };
    case 'try on pants': {
      const isMen = index % 2 === 0;
      return {
        category: isMen ? 'men' : 'women',
        categoryName: isMen ? 'Men' : 'Women',
        gender: isMen ? 'men' : 'women',
        season: 'all-season',
        style: 'casual',
        sizes: isMen ? ['30', '32', '34', '36'] : ['26', '28', '30', '32'],
        basePrice: 1499 + (index * 150) % 1500,
        discount: 20 + (index * 5) % 25,
        tags: [isMen ? 'men' : 'women', 'pants', 'trousers', 'chinos', 'bottoms', 'slacks', 'casual', 'formal'],
        description: 'Tailored everyday bottoms crafted with flexible comfort-stretch twill, reinforced pockets, and a modern contour fit.',
      };
    }
    case 'try on shirts': {
      const isMen = index % 2 === 0;
      return {
        category: isMen ? 'men-tshirts' : 'women-tshirts',
        categoryName: isMen ? 'Men T-Shirts' : 'Women T-Shirts',
        gender: isMen ? 'men' : 'women',
        season: 'all-season',
        style: 'casual',
        sizes: ['S', 'M', 'L', 'XL'],
        basePrice: 999 + (index * 110) % 1200,
        discount: 20 + (index * 5) % 25,
        tags: [isMen ? 'men' : 'women', isMen ? 'men-tshirts' : 'women-tshirts', 'shirt', 'top', 'casual', 'button-down', 'cotton'],
        description: 'Versatile cotton fashion top featuring soft tactile weave, clean collar contours, and effortless pairing across seasons.',
      };
    }
    case 'women accessories':
      return {
        category: 'accessories',
        categoryName: 'Accessories',
        gender: 'women',
        season: 'all-season',
        style: 'luxury',
        sizes: ['Free Size'],
        basePrice: 899 + (index * 120) % 2400,
        discount: 20 + (index * 5) % 30,
        tags: ['women', 'accessories', 'jewelry', 'earrings', 'necklace', 'handbag', 'clutch', 'bangle', 'kundan'],
        description: 'Exquisite handcrafted women\'s accessory showcasing high-grade finishes, artisanal embellishments, and timeless sophistication.',
      };
    case 'women formal':
      return {
        category: 'formal',
        categoryName: 'Formals',
        gender: 'women',
        season: 'all-season',
        style: 'formal',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        basePrice: 2499 + (index * 350) % 2500,
        discount: 15 + (index * 5) % 25,
        tags: ['women', 'formal', 'blazer', 'co-ord', 'sheath dress', 'executive', 'workwear'],
        description: 'Sharp contemporary women\'s executive apparel cut from crease-resistant crepe fabric with sculpted silhouettes and boardroom polish.',
      };
    case 'women tarditional dress':
      return {
        category: 'traditional',
        categoryName: 'Festive / Traditional',
        gender: 'women',
        season: 'festive',
        style: 'ethnic',
        sizes: ['S', 'M', 'L', 'XL'],
        basePrice: 3299 + (index * 420) % 4500,
        discount: 25 + (index * 5) % 25,
        tags: ['women', 'traditional', 'anarkali', 'saree', 'lehenga', 'festive', 'ethnic', 'wedding', 'kurti'],
        description: 'Magnificent heritage Indian celebration wear featuring opulent zari borders, hand-guided embroidery, and flowing regal silhouettes.',
      };
    case 'women tshirts':
      return {
        category: 'women-tshirts',
        categoryName: 'Women T-Shirts',
        gender: 'women',
        season: 'all-season',
        style: 'casual',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        basePrice: 799 + (index * 80) % 900,
        discount: 20 + (index * 5) % 30,
        tags: ['women', 'women-tshirts', 'tshirt', 'crop top', 'oversized', 'graphic tee', 'casual', 'cotton'],
        description: 'Soft-touch combed cotton everyday t-shirt designed with relaxed drape, ribbed neckline, and contemporary graphic detailing.',
      };
    case 'women winter':
      return {
        category: 'winter',
        categoryName: 'Winter Wear',
        gender: 'women',
        season: 'winter',
        style: 'luxury',
        sizes: ['S', 'M', 'L', 'XL'],
        basePrice: 2999 + (index * 380) % 3500,
        discount: 20 + (index * 5) % 25,
        tags: ['women', 'winter', 'coat', 'jacket', 'puffer', 'trench', 'cardigan', 'wool', 'warm'],
        description: 'Thermal-insulated luxury winter wear engineered with wind-resistant storm shells, plush fleece linings, and elegant silhouettes.',
      };
    default:
      return {
        category: 'casual',
        categoryName: 'Casual',
        gender: 'unisex',
        season: 'all-season',
        style: 'casual',
        sizes: ['S', 'M', 'L'],
        basePrice: 1499,
        discount: 20,
        tags: ['casual', 'apparel'],
        description: 'Modern fashion staple blending premium comfort and effortless style.',
      };
  }
}

// Read all files systematically
const subdirs = fs.readdirSync(imagesDir).filter(f => fs.statSync(path.join(imagesDir, f)).isDirectory());
subdirs.sort();

let allProducts = [];
let globalIndex = 1;

subdirs.forEach(subdir => {
  const files = fs.readdirSync(path.join(imagesDir, subdir)).filter(f => !fs.statSync(path.join(imagesDir, subdir, f)).isDirectory());
  files.sort();

  files.forEach((file, idx) => {
    const config = getFolderConfig(subdir, idx);
    const title = formatTitle(subdir, file, idx);
    const price = config.basePrice;
    const originalPrice = Math.round(price / (1 - config.discount / 100));
    const imagePath = `/images/${subdir}/${file}`;
    
    // Tag distribution: 30% New Arrival, 30% Festive Offer, 25% Sale, 15% null
    let tag = null;
    let isNewArrival = false;
    let isFestiveOffer = false;
    let isOnSale = false;

    const mod = (globalIndex + idx) % 10;
    if (mod === 0 || mod === 1 || mod === 2) {
      tag = 'New Arrival';
      isNewArrival = true;
    } else if (mod === 3 || mod === 4 || mod === 5) {
      tag = 'Festive Offer';
      isFestiveOffer = true;
    } else if (mod === 6 || mod === 7) {
      tag = 'Sale';
      isOnSale = true;
    }

    const rating = +(4.3 + (((globalIndex * 7) % 7) * 0.1)).toFixed(1);
    const reviewsCount = 35 + ((globalIndex * 17) % 310);
    const inStock = 12 + ((globalIndex * 9) % 38);

    const product = {
      id: `prod-${globalIndex}`,
      name: title,
      title: title, // Explicit user requirement
      gender: config.gender,
      category: config.category,
      categoryName: config.categoryName,
      season: config.season,
      style: config.style,
      tags: [...config.tags, title.toLowerCase().split(' ')].flat(),
      price: price,
      originalPrice: originalPrice,
      discountPercent: config.discount,
      rating: rating > 5.0 ? 4.9 : rating,
      reviewsCount: reviewsCount,
      sizes: config.sizes,
      imageUrl: imagePath,
      image: imagePath, // Explicit user requirement
      tag: tag,
      isFestiveOffer: isFestiveOffer,
      isOnSale: isOnSale,
      isNewArrival: isNewArrival,
      description: config.description,
      inStock: inStock,
    };

    allProducts.push(product);
    globalIndex++;
  });
});

console.log(`Generated total of ${allProducts.length} products across all image folders.`);

const outputContent = `// StyleStack Central Fashion Catalog Dataset
// Dynamically built from all image directories in /public/images/ (Total: ${allProducts.length} items)

export const MOCK_CATEGORIES = [
  { id: 'all', name: 'All Collection' },
  { id: 'men-tshirts', name: 'Men T-Shirts' },
  { id: 'women-tshirts', name: 'Women T-Shirts' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'men', name: 'Men' },
  { id: 'women', name: 'Women' },
  { id: 'traditional', name: 'Festive / Traditional' },
  { id: 'formal', name: 'Formals' },
  { id: 'casual', name: 'Casual / Summer' },
  { id: 'winter', name: 'Winter Wear' },
];

export const MOCK_QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new-arrivals', label: 'New Arrivals' },
  { id: 'festive-offers', label: 'Festive Offers' },
  { id: 'on-sale', label: 'On Sale' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
];

export const MOCK_SIZES = ['S', 'M', 'L', 'XL', 'Free Size'];

export const MOCK_PRODUCTS = ${JSON.stringify(allProducts, null, 2)};

export const MOCK_USER = {
  id: 'usr-101',
  name: 'Princel Tixeira',
  email: 'princel@stylestack.com',
  avatar: null,
};
`;

fs.writeFileSync(mockDataPath, outputContent, 'utf-8');
console.log(`Successfully written ${allProducts.length} products to ${mockDataPath}`);
