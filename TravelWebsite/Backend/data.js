const TOURS = [
  {
    city: "Paris",
    region: "Europe",
    scene: "paris",
    image: "https://cdn.pixabay.com/photo/2024/04/25/03/37/eiffel-tower-8718845_1280.jpg",
    type: "City Break",
    title: "City Tours in Europe, Paris",
    days: 7,
    price: 2500,
    was: 2800,
    rating: 4,
    reviews: 1,
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    blurb: "Seine cruises, Montmartre mornings and a skip-the-line climb up the iron lady herself."
  },
  {
    city: "Dubai",
    region: "Asia",
    scene: "dubai",
    image: "https://images.pexels.com/photos/35687870/pexels-photo-35687870.jpeg",
    type: "City Break",
    title: "Dubai Skyline & Desert Nights",
    days: 7,
    price: 2500,
    was: 2800,
    rating: 5,
    reviews: 5,
    months: [
      "October",
      "November",
      "December",
      "January",
      "February",
      "March"
    ],
    blurb: "Marina lights, souk bargains and a sunset dune drive followed by a Bedouin camp dinner."
  },
  { id: 3, city: 'Istanbul', region: 'Europe', scene: 'istanbul', image: 'https://images.pexels.com/photos/8106840/pexels-photo-8106840.jpeg', type: 'Culture', title: 'Istanbul – Domes & Bosphorus', days: 5, price: 1430, rating: 4, reviews: 3, months: ['March','April','May','June','September','October','November'], blurb: 'Blue Mosque, spice bazaars and ferry hops between two continents.' },
  { id: 4, city: 'London', region: 'Europe', scene: 'london', image: 'https://images.pexels.com/photos/39473887/pexels-photo-39473887.jpeg', type: 'City Break', title: 'London Streets & Royal Walks', days: 3, price: 890, rating: 4, reviews: 8, months: ['January','February','March','April','May','June','July','August','September','October','November','December'], blurb: 'Red buses, riverside walks and a back-lane pub crawl through centuries of history.' },
  { id: 5, city: 'Hallstatt', region: 'Europe', scene: 'vienna', image: 'https://images.pexels.com/photos/19343897/pexels-photo-19343897.jpeg?', type: 'Nature', title: 'Austria – Palaces & Lakes', days: 6, price: 1750, rating: 5, reviews: 12, months: ['May','June','July','August','September'], blurb: 'Vienna’s Belvedere gardens, then alpine lake villages straight out of a postcard.' },
  { id: 6, city: 'Scotland', region: 'Europe', scene: 'scotland', image: 'https://images.pexels.com/photos/34975351/pexels-photo-34975351.jpeg', type: 'Adventure', title: 'Scotland – Castles & Lochs', days: 8, price: 1990, was: 2290, rating: 4, reviews: 6, months: ['April','May','June','July','August','September'], blurb: 'Fairytale castles, single-malt tastings and the long road through the Highlands.' },
  { id: 7, city: 'Amalfi', region: 'Europe', scene: 'italy', image: 'https://images.pexels.com/photos/33839189/pexels-photo-33839189.jpeg', type: 'Beach & Sea', title: 'Italy – Amalfi Coast Escape', days: 7, price: 2150, rating: 5, reviews: 9, months: ['May','June','July','August','September'], blurb: 'Lemon groves, cliffside villages and boat days on impossibly blue water.' },
  { id: 8, city: 'Serengeti', region: 'Africa', scene: 'africa', image: 'https://images.pexels.com/photos/39034102/pexels-photo-39034102.jpeg', type: 'Adventure', title: 'Africa – Great Migration Safari', days: 9, price: 3400, rating: 5, reviews: 14, months: ['June','July','August','September','October'], blurb: 'Open-roof game drives at golden hour and nights under a sky full of stars.' },
  { id: 9, city: 'Phi Phi', region: 'Asia', scene: 'sea', image: 'https://images.pexels.com/photos/13311002/pexels-photo-13311002.jpeg', type: 'Beach & Sea', title: 'Island Hopping & Turquoise Coves', days: 5, price: 980, rating: 4, reviews: 22, months: ['November','December','January','February','March','April'], blurb: 'Longtail boats, hidden lagoons and snorkelling over living reef.' },
  { id: 10, city: 'New York', region: 'North America', scene: 'newyork', image: 'https://images.pexels.com/photos/27807670/pexels-photo-27807670.jpeg', type: 'City Break', title: 'New York – Skyline Weekend', days: 3, price: 1190, rating: 4, reviews: 11, months: ['January','February','March','April','May','June','July','August','September','October','November','December'], blurb: 'Rooftops, Central Park picnics and a sunset harbour cruise.' },
  { id: 11, city: 'Banff', region: 'North America', scene: 'banff', image: 'https://images.pexels.com/photos/29188538/pexels-photo-29188538.jpeg', type: 'Nature', title: 'Canadian Rockies Road Trip', days: 8, price: 2600, rating: 5, reviews: 7, months: ['June','July','August','September'], blurb: 'Glacial lakes, wildlife spotting and scenic drives along the Icefields Parkway.' },
  { id: 12, city: 'Kyoto', region: 'Asia', scene: 'tokyo', image: 'https://images.pexels.com/photos/33686601/pexels-photo-33686601.jpeg', type: 'Culture', title: 'Japan – Temples & Cherry Blossom', days: 10, price: 3150, rating: 5, reviews: 18, months: ['March','April','October','November'], blurb: 'Pagodas, tea ceremonies and the bullet train between Kyoto and Tokyo.' },
  { id: 13, city: 'Rio', region: 'South America', scene: 'rio', image: 'https://images.pexels.com/photos/32644181/pexels-photo-32644181.jpeg', type: 'Beach & Sea', title: 'Rio – Beaches & Mountain Views', days: 6, price: 1650, rating: 4, reviews: 5, months: ['December','January','February','March','April'], blurb: 'Sugarloaf at sunset, samba nights and long lazy days on Ipanema.' },
  { id: 14, city: 'Ubud', region: 'Asia', scene: 'bali', image: 'https://images.pexels.com/photos/38868370/pexels-photo-38868370.jpeg', type: 'Nature', title: 'Bali – Rice Terraces & Temples', days: 7, price: 1320, rating: 5, reviews: 16, months: ['April','May','June','July','August','September','October'], blurb: 'Yoga at dawn, waterfall swims and a cooking class in a family compound.' },
  { id: 15, city: 'Cairo', region: 'Africa', scene: 'cairo', image: 'https://images.pexels.com/photos/5609738/pexels-photo-5609738.jpeg', type: 'Culture', title: 'Egypt – Pyramids & the Nile', days: 8, price: 1880, rating: 4, reviews: 10, months: ['October','November','December','January','February','March'], blurb: 'Giza at sunrise, a felucca at dusk and Luxor’s temples in between.' }
];

const FEATURED = ['paris', 'dubai', 'istanbul', 'london', 'vienna', 'scotland'];

const DESTINATIONS = {
  'North America': [
    { name: 'New York', sub: 'The city that never sleeps', scene: 'newyork', image: 'https://images.pexels.com/photos/27807670/pexels-photo-27807670.jpeg' },
    { name: 'Banff', sub: 'Lakes under the Rockies', scene: 'banff', image: 'https://images.pexels.com/photos/27988592/pexels-photo-27988592.jpeg' },
    { name: 'Utah', sub: 'Red rock & big skies', scene: 'park', image: 'https://images.pexels.com/photos/20890850/pexels-photo-20890850.jpeg' },
    { name: 'Vancouver', sub: 'Mountains meet the sea', scene: 'mountain', image: 'https://images.pexels.com/photos/18784844/pexels-photo-18784844.jpeg' }
  ],
  Europe: [
    { name: 'London', sub: 'in the streets of London', scene: 'london', image: 'https://images.pexels.com/photos/19466056/pexels-photo-19466056.jpeg' },
    { name: 'Paris', sub: 'Beautiful City in the World', scene: 'paris', image: 'https://images.pexels.com/photos/11218590/pexels-photo-11218590.jpeg' },
    { name: 'Italy', sub: 'Beautiful City in the World', scene: 'italy', image: 'https://images.pexels.com/photos/36732237/pexels-photo-36732237.jpeg' },
    { name: 'Scotland', sub: 'Castles & highlands', scene: 'scotland', image: 'https://images.pexels.com/photos/40181504/pexels-photo-40181504.jpeg' },
    { name: 'Istanbul', sub: 'Where two continents meet', scene: 'istanbul', image: 'https://images.pexels.com/photos/20577444/pexels-photo-20577444.jpeg' }
  ],
  Africa: [
    { name: 'Serengeti', sub: 'Home of the great migration', scene: 'africa', image: 'https://images.pexels.com/photos/33650529/pexels-photo-33650529.jpeg' },
    { name: 'Cairo', sub: 'Pyramids & pharaohs', scene: 'cairo', image: 'https://images.pexels.com/photos/20226435/pexels-photo-20226435.jpeg' },
    { name: 'Zanzibar', sub: 'Spice island beaches', scene: 'sea', image: 'https://images.pexels.com/photos/33629222/pexels-photo-33629222.jpeg' }
  ],
  Asia: [
    { name: 'Dubai', sub: 'Skyline of the future', scene: 'dubai', image: 'https://images.pexels.com/photos/15478194/pexels-photo-15478194.jpeg' },
    { name: 'Kyoto', sub: 'Temples & blossoms', scene: 'tokyo', image: 'https://images.pexels.com/photos/5779237/pexels-photo-5779237.jpeg' },
    { name: 'Bali', sub: 'Island of the gods', scene: 'bali', image: 'https://images.pexels.com/photos/20993670/pexels-photo-20993670.jpeg' },
    { name: 'Phi Phi', sub: 'Turquoise coves', scene: 'sea', image: 'https://images.pexels.com/photos/13311002/pexels-photo-13311002.jpeg' }
  ],
  'South America': [
    { name: 'Rio', sub: 'Marvelous city', scene: 'rio', image: 'https://images.pexels.com/photos/31878100/pexels-photo-31878100.jpeg' },
    { name: 'Patagonia', sub: 'End of the world', scene: 'mountain', image: 'https://images.pexels.com/photos/26577010/pexels-photo-26577010.jpeg' },
    { name: 'Atacama', sub: 'Desert of stars', scene: 'hills', image: 'https://images.pexels.com/photos/27103739/pexels-photo-27103739.jpeg' }
  ],
  Oceania: [
    {
      name: 'Sydney',
      sub: 'Harbour, beaches & sunshine',
      scene: 'sydney',
      image: 'https://images.pexels.com/photos/783682/pexels-photo-783682.jpeg'
    },
    {
      name: 'New Zealand',
      sub: 'Mountains, lakes & adventure',
      scene: 'newzealand',
      image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg'
    }
  ]
};

const COUNTS = [
  ['Europe', '05'], ['Africa', '15'], ['Asia', '12'], ['Oceania', '02'], ['North America', '08'], ['South America', '27']
];

module.exports = TOURS;
module.exports.TOURS = TOURS;
module.exports.FEATURED = FEATURED;
module.exports.DESTINATIONS = DESTINATIONS;
module.exports.COUNTS = COUNTS;