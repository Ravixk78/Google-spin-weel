export const DEFAULT_PRIZE_MAP = {
  1: {
    name: 'Lafirma Spray 300ml',
    description: 'Lafirma Room & Fabric Spray 300ml',
    name_ar: 'بخاخ لافيرما 300 مل'
  },
  2: {
    name: 'Special Oudh Masala Incense',
    description: 'Special Oudh Masala Incense Sticks',
    name_ar: 'بخور عود مسالا خاص'
  },
  3: {
    name: 'Misk al Wardi Attar 1/4',
    description: 'Misk al Wardi Concentrated Perfume Oil 1/4 Tola',
    name_ar: 'عطر مسك الوردي ربع تولة'
  },
  4: {
    name: 'Mukallath Khady Attar 1/4',
    description: 'Mukallath Khady Pure Oud Oil 1/4 Tola',
    name_ar: 'عطر مخلط خدي ربع تولة'
  },
  5: {
    name: 'Khayan Attar 1/4',
    description: 'Khayan Royal Oud Attar 1/4 Tola',
    name_ar: 'عطر خيان ربع تولة'
  },
  6: {
    name: 'Rose Fresh Hair Mist 30ml',
    description: 'Rose Parfum Fresh Hair Mist 30ml',
    name_ar: 'معطر شعر روز فريش 30 مل'
  },
  7: {
    name: 'Rashat Musk EDP Perfume',
    description: 'Rashat Musk Luxury Eau De Parfum',
    name_ar: 'عطر رشات مسك'
  },
  8: {
    name: 'Vaseline Powder Cream',
    description: 'Vaseline Powder Fragrance Cream Jar',
    name_ar: 'كريم فازلين بودرة'
  }
};

export const GENERIC_PRIZE_NAME_MAP = {
  'Prize 1': 'Lafirma Spray 300ml',
  'Prize 2': 'Special Oudh Masala Incense',
  'Prize 3': 'Misk al Wardi Attar 1/4',
  'Prize 4': 'Mukallath Khady Attar 1/4',
  'Prize 5': 'Khayan Attar 1/4',
  'Prize 6': 'Rose Fresh Hair Mist 30ml',
  'Prize 7': 'Rashat Musk EDP Perfume',
  'Prize 8': 'Vaseline Powder Cream',
  'prize 1': 'Lafirma Spray 300ml',
  'prize 2': 'Special Oudh Masala Incense',
  'prize 3': 'Misk al Wardi Attar 1/4',
  'prize 4': 'Mukallath Khady Attar 1/4',
  'prize 5': 'Khayan Attar 1/4',
  'prize 6': 'Rose Fresh Hair Mist 30ml',
  'prize 7': 'Rashat Musk EDP Perfume',
  'prize 8': 'Vaseline Powder Cream'
};

/**
 * Resolves a prize name. If the name is generic (like "Prize 1", "Prize 2", etc.),
 * returns the real product title.
 */
export const resolvePrizeName = (name, displayOrder) => {
  if (!name) {
    const order = Number(displayOrder) || 1;
    return DEFAULT_PRIZE_MAP[order]?.name || 'Reward Prize';
  }

  const trimmed = String(name).trim();
  if (GENERIC_PRIZE_NAME_MAP[trimmed]) {
    return GENERIC_PRIZE_NAME_MAP[trimmed];
  }

  const genericMatch = trimmed.match(/^prize\s*(\d+)$/i);
  if (genericMatch) {
    const num = parseInt(genericMatch[1], 10);
    if (DEFAULT_PRIZE_MAP[num]) {
      return DEFAULT_PRIZE_MAP[num].name;
    }
  }

  if (displayOrder && DEFAULT_PRIZE_MAP[displayOrder] && /^prize/i.test(trimmed)) {
    return DEFAULT_PRIZE_MAP[displayOrder].name;
  }

  return trimmed;
};

/**
 * Resolves a prize description.
 */
export const resolvePrizeDescription = (description, displayOrder) => {
  const order = Number(displayOrder) || 1;
  if (!description || /^prize\s*item\s*\d+$/i.test(String(description).trim())) {
    return DEFAULT_PRIZE_MAP[order]?.description || description || 'Luxury Reward Item';
  }
  return description;
};
