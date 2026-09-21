/* ------------------------------------------------------------------ */
/* Katalog ma'lumotlari — backend (catalog/models.py) bilan bir xil    */
/* shaklda: Category (ota-bola), Product, variantlar.                  */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  { id: 1, slug: "living", name: { uz: "Mehmonxona", ru: "Гостиная" }, parent: null, image: "sofa" },
  { id: 2, slug: "sofas", name: { uz: "Divanlar", ru: "Диваны" }, parent: "living", image: "sofa" },
  { id: 3, slug: "armchairs", name: { uz: "Fotellar", ru: "Кресла" }, parent: "living", image: "armchair" },
  { id: 4, slug: "coffee-tables", name: { uz: "Jurnal stollari", ru: "Журнальные столы" }, parent: "living", image: "coffee" },
  { id: 5, slug: "kitchen", name: { uz: "Oshxona", ru: "Кухня" }, parent: null, image: "kitchen" },
  { id: 6, slug: "kitchen-sets", name: { uz: "Oshxona garniturlari", ru: "Кухонные гарнитуры" }, parent: "kitchen", image: "kitchen" },
  { id: 7, slug: "dining", name: { uz: "Ovqatlanish stollari", ru: "Обеденные столы" }, parent: "kitchen", image: "dining" },
  { id: 8, slug: "bedroom", name: { uz: "Yotoqxona", ru: "Спальня" }, parent: null, image: "bed" },
  { id: 9, slug: "beds", name: { uz: "Karavotlar", ru: "Кровати" }, parent: "bedroom", image: "bed" },
  { id: 10, slug: "wardrobes", name: { uz: "Garderoblar", ru: "Шкафы и гардеробы" }, parent: "bedroom", image: "wardrobe" },
  { id: 11, slug: "office", name: { uz: "Ofis", ru: "Офис" }, parent: null, image: "desk" },
  { id: 12, slug: "desks", name: { uz: "Ish stollari", ru: "Письменные столы" }, parent: "office", image: "desk" },
];

export const MATERIALS = [
  { key: "beech", label: { uz: "Buk yog'ochi", ru: "Бук" } },
  { key: "oak", label: { uz: "Eman yog'ochi", ru: "Дуб" } },
  { key: "walnut", label: { uz: "Yong'oq yog'ochi", ru: "Орех" } },
  { key: "mdf", label: { uz: "MDF / LDSP", ru: "МДФ / ЛДСП" } },
  { key: "linen", label: { uz: "Zig'ir mato", ru: "Льняная ткань" } },
  { key: "velour", label: { uz: "Velur", ru: "Велюр" } },
  { key: "boucle", label: { uz: "Bukle mato", ru: "Ткань букле" } },
  { key: "rattan", label: { uz: "Ratan", ru: "Ротанг" } },
];

export const PRODUCTS = [
  {
    id: 1,
    slug: "osaka-divani",
    name: { uz: "«Osaka» divani", ru: "Диван «Осака»" },
    description: {
      uz: "Uch kishilik «Osaka» divani buk yog'ochidan ishlangan mustahkam karkas va zig'ir matoga ega. O'tirish qismi yuqori zichlikdagi porolondan — yillar davomida shaklini yo'qotmaydi. Qoplamasi yechilib, kimyoviy tozalashga berish mumkin.",
      ru: "Трёхместный диван «Осака» — прочный каркас из бука и обивка из льна. Сиденье из поролона высокой плотности годами держит форму. Чехол снимается и подходит для химчистки.",
    },
    category: "sofas",
    price: 6_900_000,
    old_price: 7_800_000,
    image: "sofa",
    material: "beech",
    materialLabel: { uz: "Buk yog'ochi, zig'ir mato", ru: "Бук, льняная ткань" },
    width: 220,
    depth: 95,
    height: 85,
    variants: [
      { id: 1, name: { uz: "Yashil", ru: "Зелёный" }, hex: "#6f7d5c" },
      { id: 2, name: { uz: "Kulrang", ru: "Серый" }, hex: "#9a9a92" },
      { id: 3, name: { uz: "Qumrang", ru: "Песочный" }, hex: "#cbb591" },
    ],
    status: "in_stock",
    stock: 4,
    is_featured: true,
    is_new: true,
    popularity: 92,
    created_at: "2026-01-18",
  },
  {
    id: 2,
    slug: "bergen-burchak-divani",
    name: { uz: "«Bergen» burchak divani", ru: "Угловой диван «Берген»" },
    description: {
      uz: "Keng oilalar uchun mo'ljallangan «Bergen» burchak divani bukle matoda tikiladi. Chap yoki o'ng burchak variantida buyurtma qilish mumkin. Ichki qismi — quritilgan qarag'ay karkas va mustaqil prujinali blok.",
      ru: "Угловой диван «Берген» для большой семьи, обивка из ткани букле. Можно заказать левый или правый угол. Внутри — сушёный сосновый каркас и независимый пружинный блок.",
    },
    category: "sofas",
    price: 9_400_000,
    old_price: null,
    image: "corner",
    material: "boucle",
    materialLabel: { uz: "Bukle mato, qarag'ay", ru: "Букле, сосна" },
    width: 280,
    depth: 160,
    height: 82,
    variants: [
      { id: 4, name: { uz: "Krem", ru: "Кремовый" }, hex: "#d8cbb2" },
      { id: 5, name: { uz: "Surp", ru: "Графит" }, hex: "#5d5b56" },
    ],
    status: "on_order",
    stock: 0,
    is_featured: true,
    is_new: false,
    popularity: 88,
    created_at: "2025-11-02",
  },
  {
    id: 3,
    slug: "aura-foteli",
    name: { uz: "«Aura» foteli", ru: "Кресло «Аура»" },
    description: {
      uz: "O'rta asr uslubidagi «Aura» foteli eman yog'ochidan egilgan karkasga ega. Yumshoq bukle yostig'i tanani to'liq qamrab oladi. Kitab o'qish burchagi uchun eng sevimli tanlov.",
      ru: "Кресло «Аура» в стиле mid-century с гнутым каркасом из дуба. Мягкая подушка из букле обволакивает тело. Любимый выбор для уголка чтения.",
    },
    category: "armchairs",
    price: 3_200_000,
    old_price: null,
    image: "armchair",
    material: "oak",
    materialLabel: { uz: "Eman, bukle mato", ru: "Дуб, букле" },
    width: 78,
    depth: 80,
    height: 96,
    variants: [
      { id: 6, name: { uz: "Sut rang", ru: "Молочный" }, hex: "#e6ddc9" },
      { id: 7, name: { uz: "Asal", ru: "Медовый" }, hex: "#c99b57" },
    ],
    status: "in_stock",
    stock: 7,
    is_featured: false,
    is_new: true,
    popularity: 74,
    created_at: "2026-01-25",
  },
  {
    id: 4,
    slug: "loft-jurnal-stoli",
    name: { uz: "«Loft» jurnal stoli", ru: "Журнальный стол «Лофт»" },
    description: {
      uz: "Yong'oq yog'ochidan yo'nib ishlangan oyoqlar va pastki tokcha — «Loft» stoli mehmonxonaning markaziga aylanadi. Sirt tabiiy moy bilan ishlangan, suv va issiqqa chidamli.",
      ru: "Точёные ножки из ореха и нижняя полка — стол «Лофт» станет центром гостиной. Поверхность обработана натуральным маслом, устойчива к воде и горячему.",
    },
    category: "coffee-tables",
    price: 1_450_000,
    old_price: 1_700_000,
    image: "coffee",
    material: "walnut",
    materialLabel: { uz: "Yong'oq yog'ochi", ru: "Массив ореха" },
    width: 90,
    depth: 90,
    height: 42,
    variants: [{ id: 16, name: { uz: "Yong'oq", ru: "Орех" }, hex: "#5c4327" }],
    status: "in_stock",
    stock: 12,
    is_featured: false,
    is_new: false,
    popularity: 65,
    created_at: "2025-09-14",
  },
  {
    id: 5,
    slug: "provans-oshxona-garnituri",
    name: { uz: "«Provans» oshxona garnituri", ru: "Кухня «Прованс»" },
    description: {
      uz: "«Provans» garnituri sizning oshxonangiz o'lchamiga moslab yasaydi: MDF fasadlar, eman ish yuzasi va mess tutqichlar. Loyiha 3D chizma asosida, o'rnatish narxga kiritilgan.",
      ru: "Гарнитур «Прованс» изготовим под размеры вашей кухни: фасады МДФ, столешница из дуба, латунные ручки. Проект по 3D-чертежу, монтаж включён в цену.",
    },
    category: "kitchen-sets",
    price: 18_500_000,
    old_price: null,
    image: "kitchen",
    material: "mdf",
    materialLabel: { uz: "MDF, eman ish yuzasi", ru: "МДФ, дубовая столешница" },
    width: 300,
    depth: 60,
    height: 240,
    variants: [
      { id: 8, name: { uz: "Yashil", ru: "Зелёный" }, hex: "#7d8a6f" },
      { id: 9, name: { uz: "Oq", ru: "Белый" }, hex: "#ece7db" },
    ],
    status: "on_order",
    stock: 0,
    is_featured: true,
    is_new: false,
    popularity: 81,
    created_at: "2025-10-20",
  },
  {
    id: 6,
    slug: "oilaviy-ovqatlanish-stoli",
    name: { uz: "«Oilaviy» stoli + 6 stul", ru: "Стол «Семейный» + 6 стульев" },
    description: {
      uz: "To'liq eman massividan ishlangan to'plam: 180 sm stol va ratan o'rindiqqli 6 ta stul. Dasturxon atrofida uch avlod sig'adi — bu bizning eng ko'p so'raladigan to'plamimiz.",
      ru: "Комплект из массива дуба: стол 180 см и шесть стульев с сиденьями из ротанга. За ним помещаются три поколения — наш самый запрашиваемый комплект.",
    },
    category: "dining",
    price: 5_600_000,
    old_price: 6_200_000,
    image: "dining",
    material: "oak",
    materialLabel: { uz: "Eman, ratan", ru: "Дуб, ротанг" },
    width: 180,
    depth: 90,
    height: 76,
    variants: [
      { id: 10, name: { uz: "Tabiiy eman", ru: "Натуральный дуб" }, hex: "#b98d55" },
      { id: 11, name: { uz: "Qoraytirilgan", ru: "Морёный" }, hex: "#6e4f30" },
    ],
    status: "in_stock",
    stock: 3,
    is_featured: true,
    is_new: false,
    popularity: 90,
    created_at: "2025-08-30",
  },
  {
    id: 7,
    slug: "orzu-karavoti",
    name: { uz: "«Orzu» karavoti 160×200", ru: "Кровать «Орзу» 160×200" },
    description: {
      uz: "Kanalli bosh suyanchiq va o'tirish joyiga ega «Orzu» karavoti yotoqxonaga mehmonxona hashamini beradi. Ko'tarish mexanizmi ostida — keng kir yuvish qutisi. Matras to'plamga kirmaydi.",
      ru: "Кровать «Орзу» с изголовьем в каналах и мягким основанием придаст спальне гостиничный шик. Под подъёмным механизмом — вместительный бельевой ящик. Матрас не входит в комплект.",
    },
    category: "beds",
    price: 7_200_000,
    old_price: null,
    image: "bed",
    material: "velour",
    materialLabel: { uz: "Velur, yong'oq oyoqlar", ru: "Велюр, ножки из ореха" },
    width: 175,
    depth: 215,
    height: 118,
    variants: [
      { id: 12, name: { uz: "Suli", ru: "Овсяный" }, hex: "#d7c9ad" },
      { id: 13, name: { uz: "Zaytun", ru: "Оливковый" }, hex: "#8a8a6d" },
    ],
    status: "in_stock",
    stock: 5,
    is_featured: true,
    is_new: true,
    popularity: 86,
    created_at: "2026-02-02",
  },
  {
    id: 8,
    slug: "atlas-garderobi",
    name: { uz: "«Atlas» garderobi", ru: "Гардероб «Атлас»" },
    description: {
      uz: "To'rt eshikli «Atlas» garderobi yong'oq shpon bilan qoplangan. Ichida — ikki qavatli rels, tortmalar va oyna bo'limi. Eshiklar sekin yopiladigan mexanizm bilan jihozlangan.",
      ru: "Четырёхдверный гардероб «Атлас» облицован шпоном ореха. Внутри — двухъярусные рейлы, ящики и зеркальная секция. Доводчики плавного закрывания на всех дверях.",
    },
    category: "wardrobes",
    price: 8_900_000,
    old_price: null,
    image: "wardrobe",
    material: "walnut",
    materialLabel: { uz: "Yong'oq shpon, MDF", ru: "Шпон ореха, МДФ" },
    width: 200,
    depth: 60,
    height: 220,
    variants: [{ id: 17, name: { uz: "Yong'oq", ru: "Орех" }, hex: "#5c4327" }],
    status: "in_stock",
    stock: 2,
    is_featured: false,
    is_new: false,
    popularity: 58,
    created_at: "2025-07-12",
  },
  {
    id: 9,
    slug: "sokrat-ish-stoli",
    name: { uz: "«Sokrat» ish stoli", ru: "Стол «Сократ»" },
    description: {
      uz: "Uy ofisi uchun ixcham «Sokrat» stoli: yong'oq ish yuzasi, qora metall oyoqlar va yon tortma bloki. Kabel kanali orqali stol ustida hech qanday sim ko'rinmaydi.",
      ru: "Компактный стол «Сократ» для домашнего офиса: столешница из ореха, чёрные металлические ножки и боковой блок с ящиками. Кабель-канал скрывает все провода.",
    },
    category: "desks",
    price: 2_750_000,
    old_price: null,
    image: "desk",
    material: "walnut",
    materialLabel: { uz: "Yong'oq, metall", ru: "Орех, металл" },
    width: 120,
    depth: 60,
    height: 75,
    variants: [
      { id: 14, name: { uz: "Yong'oq", ru: "Орех" }, hex: "#5c4327" },
      { id: 15, name: { uz: "Eman", ru: "Дуб" }, hex: "#b98d55" },
    ],
    status: "in_stock",
    stock: 9,
    is_featured: false,
    is_new: true,
    popularity: 70,
    created_at: "2026-01-30",
  },
];

/* ------------------------------------------------------------------ */
/* Yordamchilar                                                        */
/* ------------------------------------------------------------------ */
export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);

export const childrenOf = (slug) => CATEGORIES.filter((c) => c.parent === slug);

/** Kategoriya va uning bolalariga tegishli slug'lar to'plami. */
export const categorySlugs = (slug) => [slug, ...childrenOf(slug).map((c) => c.slug)];

export const productsOf = (slug) => {
  const set = new Set(categorySlugs(slug));
  return PRODUCTS.filter((p) => set.has(p.category));
};

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const similarTo = (p, n = 4) =>
  PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .concat(PRODUCTS.filter((x) => x.category !== p.category && x.id !== p.id))
    .slice(0, n);

export const formatPrice = (v) => new Intl.NumberFormat("ru-RU").format(v) + " so'm";

export const discountOf = (p) => (p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0);
