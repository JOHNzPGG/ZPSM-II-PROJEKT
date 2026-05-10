// constants/mockComponents.ts

export type ComponentType =
  | 'CPU'
  | 'GPU'
  | 'RAM'
  | 'Motherboard'
  | 'Cooler'
  | 'PSU'
  | 'Case'
  | 'Storage';

export type Component = {
  id: string;
  type: ComponentType;
  name: string;
  brand: string;
  generation: string;
  price: number; // PLN
  specs: Record<string, string | number>;
  description: string;
};

export const MOCK_COMPONENTS: Component[] = [

  // ─── CPU ─────────────────────────────────────────────────────────────────────

  {
    id: 'cpu-001',
    type: 'CPU', brand: 'AMD', generation: 'Zen 4',
    name: 'Ryzen 5 7600X',
    price: 899,
    description: 'Najlepszy procesor mid-range na AM5. Doskonały do gier 1080p i 1440p, niskie TDP jak na wydajność.',
    specs: { Rdzenie: 6, Wątki: 12, 'Takt bazowy': '4.7 GHz', 'Takt boost': '5.3 GHz', TDP: '105 W', Socket: 'AM5', Cache: '38 MB', Litografia: '5 nm' },
  },
  {
    id: 'cpu-002',
    type: 'CPU', brand: 'AMD', generation: 'Zen 4',
    name: 'Ryzen 9 7950X',
    price: 2499,
    description: 'Flagowy AMD dla profesjonalistów. 16 rdzeni Zen 4 do renderowania, kompilacji i ciężkich zadań wielowątkowych.',
    specs: { Rdzenie: 16, Wątki: 32, 'Takt bazowy': '4.5 GHz', 'Takt boost': '5.7 GHz', TDP: '170 W', Socket: 'AM5', Cache: '80 MB', Litografia: '5 nm' },
  },
  {
    id: 'cpu-003',
    type: 'CPU', brand: 'AMD', generation: 'Zen 3',
    name: 'Ryzen 5 5600X',
    price: 499,
    description: 'Sprawdzony procesor AM4 poprzedniej generacji. Tani, energooszczędny i wciąż świetny do gier.',
    specs: { Rdzenie: 6, Wątki: 12, 'Takt bazowy': '3.7 GHz', 'Takt boost': '4.6 GHz', TDP: '65 W', Socket: 'AM4', Cache: '35 MB', Litografia: '7 nm' },
  },
  {
    id: 'cpu-004',
    type: 'CPU', brand: 'AMD', generation: 'Zen 3',
    name: 'Ryzen 9 5900X',
    price: 899,
    description: 'Topowy AM4 z 12 rdzeniami Zen 3. Świetna alternatywa dla oszczędnych budżetów — dojrzała platforma.',
    specs: { Rdzenie: 12, Wątki: 24, 'Takt bazowy': '3.7 GHz', 'Takt boost': '4.8 GHz', TDP: '105 W', Socket: 'AM4', Cache: '70 MB', Litografia: '7 nm' },
  },
  {
    id: 'cpu-005',
    type: 'CPU', brand: 'Intel', generation: 'Raptor Lake Refresh',
    name: 'Core i5-14600K',
    price: 1099,
    description: 'Najlepszy Intel do gier w tej cenie. Wysoka wydajność jednowątkowa i dobry OC potencjał.',
    specs: { Rdzenie: 14, Wątki: 20, 'Takt bazowy': '3.5 GHz', 'Takt boost': '5.3 GHz', TDP: '125 W', Socket: 'LGA1700', Cache: '44 MB', Litografia: '10 nm' },
  },
  {
    id: 'cpu-006',
    type: 'CPU', brand: 'Intel', generation: 'Raptor Lake Refresh',
    name: 'Core i9-14900K',
    price: 2199,
    description: 'Flagowy Intel desktop. Najwyższy takt boost na rynku — 6.0 GHz. Król wydajności jednowątkowej.',
    specs: { Rdzenie: 24, Wątki: 32, 'Takt bazowy': '3.2 GHz', 'Takt boost': '6.0 GHz', TDP: '125 W', Socket: 'LGA1700', Cache: '68 MB', Litografia: '10 nm' },
  },
  {
    id: 'cpu-007',
    type: 'CPU', brand: 'Intel', generation: 'Alder Lake',
    name: 'Core i5-12400F',
    price: 449,
    description: 'Budżetowy Intel LGA1700 bez układu graficznego. Zaskakująco dobra wydajność w tej cenie.',
    specs: { Rdzenie: 6, Wątki: 12, 'Takt bazowy': '2.5 GHz', 'Takt boost': '4.4 GHz', TDP: '65 W', Socket: 'LGA1700', Cache: '18 MB', Litografia: '10 nm' },
  },
  {
    id: 'cpu-008',
    type: 'CPU', brand: 'Intel', generation: 'Rocket Lake',
    name: 'Core i7-11700K',
    price: 599,
    description: 'Procesor LGA1200 poprzedniej generacji. Dobry wybór do tańszych buildów na starszych płytach Z490/Z590.',
    specs: { Rdzenie: 8, Wątki: 16, 'Takt bazowy': '3.6 GHz', 'Takt boost': '5.0 GHz', TDP: '125 W', Socket: 'LGA1200', Cache: '16 MB', Litografia: '14 nm' },
  },
  {
    id: 'cpu-009',
    type: 'CPU', brand: 'AMD', generation: 'Zen 4',
    name: 'Ryzen 7 7800X3D',
    price: 1799,
    description: 'Najszybszy procesor gamingowy na świecie dzięki technologii 3D V-Cache. Niezrównany w grach.',
    specs: { Rdzenie: 8, Wątki: 16, 'Takt bazowy': '4.5 GHz', 'Takt boost': '5.0 GHz', TDP: '120 W', Socket: 'AM5', Cache: '104 MB', Litografia: '5 nm' },
  },
  {
    id: 'cpu-010',
    type: 'CPU', brand: 'Intel', generation: 'Comet Lake',
    name: 'Core i5-10600K',
    price: 299,
    description: 'Budżetowy LGA1200 — dobry do starszych buildów lub modernizacji tanich platform Intel.',
    specs: { Rdzenie: 6, Wątki: 12, 'Takt bazowy': '4.1 GHz', 'Takt boost': '4.8 GHz', TDP: '125 W', Socket: 'LGA1200', Cache: '12 MB', Litografia: '14 nm' },
  },

  // ─── GPU ─────────────────────────────────────────────────────────────────────

  {
    id: 'gpu-001',
    type: 'GPU', brand: 'NVIDIA', generation: 'Ada Lovelace',
    name: 'RTX 4070 Super',
    price: 2799,
    description: 'Najlepsza karta mid-range Ada. DLSS 3, ray tracing bez kompromisów w 1440p.',
    specs: { VRAM: '12 GB GDDR6X', 'Szyna pamięci': '192-bit', 'Takt boost': '2.51 GHz', TDP: '220 W', Złącze: 'PCIe 4.0 x16', CUDA: 7168, Litografia: '4 nm' },
  },
  {
    id: 'gpu-002',
    type: 'GPU', brand: 'NVIDIA', generation: 'Ada Lovelace',
    name: 'RTX 4090',
    price: 7999,
    description: 'Absolutny flagowiec. Niezrównana wydajność 4K i ray tracing bez kompromisów.',
    specs: { VRAM: '24 GB GDDR6X', 'Szyna pamięci': '384-bit', 'Takt boost': '2.52 GHz', TDP: '450 W', Złącze: 'PCIe 4.0 x16', CUDA: 16384, Litografia: '4 nm' },
  },
  {
    id: 'gpu-003',
    type: 'GPU', brand: 'NVIDIA', generation: 'Ada Lovelace',
    name: 'RTX 4060',
    price: 1499,
    description: 'Energooszczędna karta 1080p z DLSS 3. Idealna do kompaktowych i cichych buildów.',
    specs: { VRAM: '8 GB GDDR6', 'Szyna pamięci': '128-bit', 'Takt boost': '2.46 GHz', TDP: '115 W', Złącze: 'PCIe 4.0 x16', CUDA: 3072, Litografia: '4 nm' },
  },
  {
    id: 'gpu-004',
    type: 'GPU', brand: 'AMD', generation: 'RDNA 3',
    name: 'RX 7800 XT',
    price: 1999,
    description: 'Świetna karta 1440p z dużą ilością VRAM. Wsparcie FSR 3 i dobra cena za wydajność.',
    specs: { VRAM: '16 GB GDDR6', 'Szyna pamięci': '256-bit', 'Takt boost': '2.43 GHz', TDP: '263 W', Złącze: 'PCIe 4.0 x16', 'Shadery': 3840, Litografia: '5 nm' },
  },
  {
    id: 'gpu-005',
    type: 'GPU', brand: 'AMD', generation: 'RDNA 3',
    name: 'RX 7900 XTX',
    price: 4299,
    description: 'Flagowa AMD — rywal RTX 4080. Ogromna ilość VRAM i świetna wydajność w 4K bez ray tracingu.',
    specs: { VRAM: '24 GB GDDR6', 'Szyna pamięci': '384-bit', 'Takt boost': '2.50 GHz', TDP: '355 W', Złącze: 'PCIe 4.0 x16', 'Shadery': 6144, Litografia: '5 nm' },
  },
  {
    id: 'gpu-006',
    type: 'GPU', brand: 'NVIDIA', generation: 'Ampere',
    name: 'RTX 3070',
    price: 1799,
    description: 'Poprzednia generacja NVIDIA — wciąż silna w 1440p. Dobry wybór na rynku wtórnym.',
    specs: { VRAM: '8 GB GDDR6', 'Szyna pamięci': '256-bit', 'Takt boost': '1.73 GHz', TDP: '220 W', Złącze: 'PCIe 4.0 x16', CUDA: 5888, Litografia: '8 nm' },
  },
  {
    id: 'gpu-007',
    type: 'GPU', brand: 'Intel', generation: 'Alchemist',
    name: 'Arc A770',
    price: 1299,
    description: 'Pierwsza poważna karta Intel z 16 GB VRAM. Wyróżnia się encodingiem AV1 i rosnącymi sterownikami.',
    specs: { VRAM: '16 GB GDDR6', 'Szyna pamięci': '256-bit', 'Takt boost': '2.10 GHz', TDP: '225 W', Złącze: 'PCIe 4.0 x16', 'Xe Cores': 32, Litografia: '6 nm' },
  },
  {
    id: 'gpu-008',
    type: 'GPU', brand: 'AMD', generation: 'RDNA 2',
    name: 'RX 6700 XT',
    price: 1349,
    description: 'Sprawdzona karta RDNA 2 do gier 1440p. Dużo VRAM i dobra wydajność rasteryzacji.',
    specs: { VRAM: '12 GB GDDR6', 'Szyna pamięci': '192-bit', 'Takt boost': '2.58 GHz', TDP: '230 W', Złącze: 'PCIe 4.0 x16', 'Shadery': 2560, Litografia: '7 nm' },
  },

  // ─── RAM ─────────────────────────────────────────────────────────────────────

  {
    id: 'ram-001',
    type: 'RAM', brand: 'Corsair', generation: 'DDR5',
    name: 'Vengeance DDR5-6000 32GB',
    price: 649,
    description: 'Optymalna para DDR5 dla AM5 i Intel 13/14 gen. XMP 3.0, szybka i stabilna.',
    specs: { Pojemność: '2× 16 GB', Typ: 'DDR5', Częstotliwość: '6000 MHz', Opóźnienia: 'CL30', Napięcie: '1.35 V', 'Profil OC': 'XMP 3.0', Radiator: 'Tak' },
  },
  {
    id: 'ram-002',
    type: 'RAM', brand: 'G.Skill', generation: 'DDR5',
    name: 'Trident Z5 RGB DDR5-7200 32GB',
    price: 999,
    description: 'Topowe DDR5 dla entuzjastów OC. Imponująca częstotliwość z pełną stabilnością.',
    specs: { Pojemność: '2× 16 GB', Typ: 'DDR5', Częstotliwość: '7200 MHz', Opóźnienia: 'CL34', Napięcie: '1.40 V', 'Profil OC': 'XMP 3.0', Radiator: 'Tak (RGB)' },
  },
  {
    id: 'ram-003',
    type: 'RAM', brand: 'G.Skill', generation: 'DDR4',
    name: 'Ripjaws V DDR4-3600 16GB',
    price: 249,
    description: 'Klasyczne DDR4 w doskonałej cenie. Idealne do budżetowych buildów AM4 i LGA1700.',
    specs: { Pojemność: '2× 8 GB', Typ: 'DDR4', Częstotliwość: '3600 MHz', Opóźnienia: 'CL16', Napięcie: '1.35 V', 'Profil OC': 'XMP 2.0', Radiator: 'Tak' },
  },
  {
    id: 'ram-004',
    type: 'RAM', brand: 'Kingston', generation: 'DDR5',
    name: 'Fury Beast DDR5-5600 64GB',
    price: 1099,
    description: '64 GB DDR5 dla stacji roboczych i twórców. Dużo pamięci bez przesadnych kosztów.',
    specs: { Pojemność: '2× 32 GB', Typ: 'DDR5', Częstotliwość: '5600 MHz', Opóźnienia: 'CL40', Napięcie: '1.25 V', 'Profil OC': 'XMP 3.0', Radiator: 'Tak' },
  },
  {
    id: 'ram-005',
    type: 'RAM', brand: 'Corsair', generation: 'DDR4',
    name: 'Vengeance RGB DDR4-3200 32GB',
    price: 339,
    description: 'Popularne DDR4 z podświetleniem RGB. Dobra wydajność i estetyka dla buildów z oknem.',
    specs: { Pojemność: '2× 16 GB', Typ: 'DDR4', Częstotliwość: '3200 MHz', Opóźnienia: 'CL16', Napięcie: '1.35 V', 'Profil OC': 'XMP 2.0', Radiator: 'Tak (RGB)' },
  },
  {
    id: 'ram-006',
    type: 'RAM', brand: 'TeamGroup', generation: 'DDR4',
    name: 'T-Force Vulcan DDR4-3600 16GB',
    price: 199,
    description: 'Najtańsze DDR4-3600 bez RGB. Niski profil — pasuje do większości chłodzeń CPU.',
    specs: { Pojemność: '2× 8 GB', Typ: 'DDR4', Częstotliwość: '3600 MHz', Opóźnienia: 'CL18', Napięcie: '1.35 V', 'Profil OC': 'XMP 2.0', Radiator: 'Tak (niski profil)' },
  },
  {
    id: 'ram-007',
    type: 'RAM', brand: 'G.Skill', generation: 'DDR5',
    name: 'Flare X5 DDR5-6000 32GB',
    price: 749,
    description: 'Zoptymalizowane pod AMD EXPO. Polecane dla platform AM5 z Ryzen 7000.',
    specs: { Pojemność: '2× 16 GB', Typ: 'DDR5', Częstotliwość: '6000 MHz', Opóźnienia: 'CL30', Napięcie: '1.35 V', 'Profil OC': 'EXPO', Radiator: 'Tak' },
  },

  // ─── Motherboard ─────────────────────────────────────────────────────────────

  {
    id: 'mb-001',
    type: 'Motherboard', brand: 'ASRock', generation: 'X670E',
    name: 'X670E Taichi',
    price: 1999,
    description: 'Flagowa płyta AM5. PCIe 5.0, DDR5, rozbudowana sekcja zasilania do OC.',
    specs: { Socket: 'AM5', Chipset: 'X670E', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR5', 'Sloty M.2': 4, USB: 'Thunderbolt 4', Sieć: '2.5 GbE + Wi-Fi 6E', Rozmiar: 'ATX' },
  },
  {
    id: 'mb-002',
    type: 'Motherboard', brand: 'Gigabyte', generation: 'B650',
    name: 'B650M Aorus Pro',
    price: 799,
    description: 'Kompaktowa mATX dla AM5 w dobrej cenie. Dobra jakość VRM i wsparcie DDR5.',
    specs: { Socket: 'AM5', Chipset: 'B650', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR5', 'Sloty M.2': 2, USB: 'USB 3.2 Gen 2', Sieć: '2.5 GbE + Wi-Fi 6E', Rozmiar: 'mATX' },
  },
  {
    id: 'mb-003',
    type: 'Motherboard', brand: 'ASUS ROG', generation: 'Z790',
    name: 'Z790 Apex',
    price: 2499,
    description: 'Płyta dla ekstremalnych overclockerów LGA1700. Najlepsza sekcja zasilania w klasie.',
    specs: { Socket: 'LGA1700', Chipset: 'Z790', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR5', 'Sloty M.2': 5, USB: 'Thunderbolt 4', Sieć: '10 GbE + Wi-Fi 6E', Rozmiar: 'E-ATX' },
  },
  {
    id: 'mb-004',
    type: 'Motherboard', brand: 'ASRock', generation: 'B760',
    name: 'B760M Pro RS',
    price: 499,
    description: 'Budżetowa mATX dla Intel 12/13/14 gen. Solidna i tania — idealna do oszczędnych buildów.',
    specs: { Socket: 'LGA1700', Chipset: 'B760', 'Sloty RAM': 2, 'Maks. RAM': '64 GB DDR4', 'Sloty M.2': 2, USB: 'USB 3.2 Gen 1', Sieć: '1 GbE', Rozmiar: 'mATX' },
  },
  {
    id: 'mb-005',
    type: 'Motherboard', brand: 'MSI', generation: 'X670E',
    name: 'MAG X670E Tomahawk',
    price: 1299,
    description: 'ATX dla AM5 w rozsądnej cenie. Dobry balans funkcji, VRM i ceny.',
    specs: { Socket: 'AM5', Chipset: 'X670E', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR5', 'Sloty M.2': 4, USB: 'USB 3.2 Gen 2', Sieć: '2.5 GbE + Wi-Fi 6E', Rozmiar: 'ATX' },
  },
  {
    id: 'mb-006',
    type: 'Motherboard', brand: 'ASUS', generation: 'B550',
    name: 'ROG Strix B550-F',
    price: 699,
    description: 'Popularna płyta AM4 z dobrym VRM i funkcjami. Idealna dla Ryzen 5000 z możliwością OC.',
    specs: { Socket: 'AM4', Chipset: 'B550', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR4', 'Sloty M.2': 2, USB: 'USB 3.2 Gen 2', Sieć: '2.5 GbE + Wi-Fi 6', Rozmiar: 'ATX' },
  },
  {
    id: 'mb-007',
    type: 'Motherboard', brand: 'Gigabyte', generation: 'Z590',
    name: 'Z590 Aorus Master',
    price: 849,
    description: 'Topowa płyta LGA1200 — idealna dla Core 10/11 gen z OC. Dobry wybór do starszych buildów.',
    specs: { Socket: 'LGA1200', Chipset: 'Z590', 'Sloty RAM': 4, 'Maks. RAM': '128 GB DDR4', 'Sloty M.2': 3, USB: 'Thunderbolt 3', Sieć: '2.5 GbE + Wi-Fi 6', Rozmiar: 'ATX' },
  },

  // ─── Cooler ───────────────────────────────────────────────────────────────────

  {
    id: 'cool-001',
    type: 'Cooler', brand: 'Noctua', generation: 'Air',
    name: 'NH-D15',
    price: 499,
    description: 'Legendarny wieżak powietrzny. Bije wiele AIO 240mm, cichy i niezawodny od lat.',
    specs: { Typ: 'Air', Wentylatory: '2× 140 mm', 'Maks. TDP': '250 W', Wysokość: '165 mm', Socket: 'AM4 / AM5 / LGA1700 / LGA1200', Hałas: '24.6 dB', Waga: '1320 g' },
  },
  {
    id: 'cool-002',
    type: 'Cooler', brand: 'Corsair', generation: 'AIO',
    name: 'iCUE H150i Elite',
    price: 799,
    description: 'AIO 360mm z pompą LCD i RGB. Doskonałe chłodzenie dla flagowych CPU, pełna integracja z iCUE.',
    specs: { Typ: 'AIO', Chłodnica: '360 mm', Wentylatory: '3× 120 mm', 'Maks. TDP': '350 W', Socket: 'AM4 / AM5 / LGA1700 / LGA1200', Hałas: '37 dB', Wyświetlacz: 'LCD 2.1"' },
  },
  {
    id: 'cool-003',
    type: 'Cooler', brand: 'be quiet!', generation: 'AIO',
    name: 'Pure Loop 2 240mm',
    price: 449,
    description: 'Cichy i niezawodny AIO 240mm. Minimalistyczny wygląd bez RGB, skoncentrowany na chłodzeniu.',
    specs: { Typ: 'AIO', Chłodnica: '240 mm', Wentylatory: '2× 120 mm', 'Maks. TDP': '280 W', Socket: 'AM4 / AM5 / LGA1700 / LGA1200', Hałas: '29 dB', Wyświetlacz: 'Brak' },
  },
  {
    id: 'cool-004',
    type: 'Cooler', brand: 'DeepCool', generation: 'Air',
    name: 'AK620',
    price: 259,
    description: 'Dwuwieżowy chłodnik powietrzny za ułamek ceny Noctuy. Świetny stosunek wydajności do ceny.',
    specs: { Typ: 'Air', Wentylatory: '2× 120 mm', 'Maks. TDP': '260 W', Wysokość: '160 mm', Socket: 'AM4 / AM5 / LGA1700 / LGA1200', Hałas: '28 dB', Waga: '1146 g' },
  },
  {
    id: 'cool-005',
    type: 'Cooler', brand: 'NZXT', generation: 'AIO',
    name: 'Kraken Elite 360',
    price: 999,
    description: 'Flagowe AIO NZXT z dużym wyświetlaczem LCD na głowicy. Doskonałe chłodzenie i efektowny wygląd.',
    specs: { Typ: 'AIO', Chłodnica: '360 mm', Wentylatory: '3× 120 mm', 'Maks. TDP': '400 W', Socket: 'AM4 / AM5 / LGA1700 / LGA1200', Hałas: '38 dB', Wyświetlacz: 'LCD 2.36"' },
  },

  // ─── PSU ─────────────────────────────────────────────────────────────────────

  {
    id: 'psu-001',
    type: 'PSU', brand: 'Corsair', generation: 'ATX 3.0',
    name: 'RM850x Shift',
    price: 649,
    description: 'Modularny PSU 850W z certyfikatem 80+ Gold. Innowacyjny boczny panel złączy — lepsze zarządzanie kablami.',
    specs: { Moc: '850 W', Certyfikat: '80+ Gold', Modularność: 'Pełna', Standard: 'ATX 3.0', 'Złącze PCIe': '12VHPWR', Zabezpieczenia: 'OVP / UVP / OCP / SCP', Gwarancja: '10 lat' },
  },
  {
    id: 'psu-002',
    type: 'PSU', brand: 'be quiet!', generation: 'ATX 3.0',
    name: 'Dark Power 13 1000W',
    price: 999,
    description: 'Flagowy PSU 1000W z certyfikatem 80+ Titanium. Absolutna cisza i najwyższa sprawność.',
    specs: { Moc: '1000 W', Certyfikat: '80+ Titanium', Modularność: 'Pełna', Standard: 'ATX 3.0', 'Złącze PCIe': '12VHPWR', Zabezpieczenia: 'OVP / UVP / OCP / OTP / SCP', Gwarancja: '10 lat' },
  },
  {
    id: 'psu-003',
    type: 'PSU', brand: 'Seasonic', generation: 'ATX 2.0',
    name: 'Focus GX-650',
    price: 449,
    description: 'Niezawodny PSU 650W 80+ Gold od jednego z najlepszych producentów zasilaczy.',
    specs: { Moc: '650 W', Certyfikat: '80+ Gold', Modularność: 'Pełna', Standard: 'ATX 2.0', 'Złącze PCIe': '8-pin × 2', Zabezpieczenia: 'OVP / UVP / OCP / SCP', Gwarancja: '10 lat' },
  },
  {
    id: 'psu-004',
    type: 'PSU', brand: 'MSI', generation: 'ATX 3.0',
    name: 'MAG A750GL PCIE5',
    price: 399,
    description: 'Tani PSU 750W z ATX 3.0 i złączem 12VHPWR dla kart RTX 40xx. Dobry wybór do mid-range buildów.',
    specs: { Moc: '750 W', Certyfikat: '80+ Gold', Modularność: 'Pełna', Standard: 'ATX 3.0', 'Złącze PCIe': '12VHPWR', Zabezpieczenia: 'OVP / UVP / OCP / SCP', Gwarancja: '7 lat' },
  },
  {
    id: 'psu-005',
    type: 'PSU', brand: 'ASUS ROG', generation: 'ATX 3.0',
    name: 'Thor II 1200W',
    price: 1299,
    description: 'Potężny PSU 1200W 80+ Platinum z wyświetlaczem OLED. Dla systemów z RTX 4090 i topowym CPU.',
    specs: { Moc: '1200 W', Certyfikat: '80+ Platinum', Modularność: 'Pełna', Standard: 'ATX 3.0', 'Złącze PCIe': '12VHPWR × 2', Zabezpieczenia: 'OVP / UVP / OCP / OTP / SCP', Gwarancja: '10 lat' },
  },

  // ─── Case ─────────────────────────────────────────────────────────────────────

  {
    id: 'case-001',
    type: 'Case', brand: 'Fractal Design', generation: 'Mid Tower',
    name: 'Torrent Compact',
    price: 599,
    description: 'Rewelacyjny przepływ powietrza przez duże siatki z przodu. Kompaktowy ale mieści E-ATX. Minimalistyczny design.',
    specs: { Format: 'Mid Tower', 'Płyty główne': 'mITX / mATX / ATX / E-ATX', Wentylatory: '2× 180 mm (w zestawie)', 'Maks. GPU': '461 mm', 'Maks. chłodnica': '360 mm', 'Boczna szyba': 'Szkło hartowane', USB: 'USB-C + 2× USB-A' },
  },
  {
    id: 'case-002',
    type: 'Case', brand: 'Lian Li', generation: 'Full Tower',
    name: 'O11 Dynamic EVO XL',
    price: 899,
    description: 'Kultowa obudowa dla buildów z RGB i AIO. Podwójna komora, dużo miejsca na radiatory i okablowanie.',
    specs: { Format: 'Full Tower', 'Płyty główne': 'mITX / mATX / ATX / E-ATX', Wentylatory: '0 (brak w zestawie)', 'Maks. GPU': '480 mm', 'Maks. chłodnica': '420 mm', 'Boczna szyba': 'Szkło hartowane × 2', USB: 'USB-C + 4× USB-A' },
  },
  {
    id: 'case-003',
    type: 'Case', brand: 'NZXT', generation: 'Mini Tower',
    name: 'H5 Flow',
    price: 449,
    description: 'Czysta estetyka NZXT w mniejszej obudowie. Dobry przepływ powietrza i łatwy montaż.',
    specs: { Format: 'Mid Tower', 'Płyty główne': 'mITX / mATX / ATX', Wentylatory: '2× 120 mm (w zestawie)', 'Maks. GPU': '365 mm', 'Maks. chłodnica': '280 mm', 'Boczna szyba': 'Szkło hartowane', USB: 'USB-C + 2× USB-A' },
  },
  {
    id: 'case-004',
    type: 'Case', brand: 'Cooler Master', generation: 'ITX',
    name: 'NR200P MAX',
    price: 999,
    description: 'Najlepsza obudowa ITX na rynku. Mieści AIO 280mm i pełnowymiarowe GPU mimo kompaktowych rozmiarów.',
    specs: { Format: 'Mini ITX', 'Płyty główne': 'mITX', Wentylatory: '2× 120 mm (w zestawie)', 'Maks. GPU': '330 mm', 'Maks. chłodnica': '280 mm', 'Boczna szyba': 'Szkło hartowane', USB: 'USB-C + 2× USB-A' },
  },
  {
    id: 'case-005',
    type: 'Case', brand: 'be quiet!', generation: 'Mid Tower',
    name: 'Silent Base 802',
    price: 699,
    description: 'Obudowa dla miłośników ciszy. Grube panele wygłuszające redukują hałas do minimum.',
    specs: { Format: 'Mid Tower', 'Płyty główne': 'mITX / mATX / ATX / E-ATX', Wentylatory: '3× 140 mm (w zestawie)', 'Maks. GPU': '369 mm', 'Maks. chłodnica': '360 mm', 'Boczna szyba': 'Szkło hartowane', USB: '2× USB-A' },
  },

  // ─── Storage ──────────────────────────────────────────────────────────────────

  {
    id: 'ssd-001',
    type: 'Storage', brand: 'Samsung', generation: 'PCIe 4.0',
    name: '990 Pro 2TB',
    price: 699,
    description: 'Najszybszy SSD konsumencki PCIe 4.0. Idealny jako dysk systemowy i do gier.',
    specs: { Pojemność: '2 TB', Interfejs: 'NVMe PCIe 4.0 x4', Odczyt: '7450 MB/s', Zapis: '6900 MB/s', 'Format': 'M.2 2280', TBW: '1200 TB', Gwarancja: '5 lat' },
  },
  {
    id: 'ssd-002',
    type: 'Storage', brand: 'WD', generation: 'PCIe 5.0',
    name: 'Black SN850X 2TB',
    price: 849,
    description: 'Topowy SSD PCIe 4.0 od WD z dedykowaną pamięcią podręczną. Stała wydajność nawet przy pełnym zapełnieniu.',
    specs: { Pojemność: '2 TB', Interfejs: 'NVMe PCIe 4.0 x4', Odczyt: '7300 MB/s', Zapis: '6600 MB/s', 'Format': 'M.2 2280', TBW: '1200 TB', Gwarancja: '5 lat' },
  },
  {
    id: 'ssd-003',
    type: 'Storage', brand: 'Crucial', generation: 'PCIe 4.0',
    name: 'T500 1TB',
    price: 349,
    description: 'Świetny stosunek ceny do wydajności PCIe 4.0. Dobry wybór do budżetowych buildów.',
    specs: { Pojemność: '1 TB', Interfejs: 'NVMe PCIe 4.0 x4', Odczyt: '7400 MB/s', Zapis: '6500 MB/s', 'Format': 'M.2 2280', TBW: '600 TB', Gwarancja: '5 lat' },
  },
  {
    id: 'ssd-004',
    type: 'Storage', brand: 'Seagate', generation: 'PCIe 5.0',
    name: 'FireCuda 530 4TB',
    price: 1299,
    description: 'Ogromna pojemność PCIe 4.0 z heatsink. Dla graczy i twórców którzy potrzebują przestrzeni i prędkości.',
    specs: { Pojemność: '4 TB', Interfejs: 'NVMe PCIe 4.0 x4', Odczyt: '7300 MB/s', Zapis: '6900 MB/s', 'Format': 'M.2 2280', TBW: '5100 TB', Gwarancja: '5 lat' },
  },
  {
    id: 'ssd-005',
    type: 'Storage', brand: 'Corsair', generation: 'PCIe 5.0',
    name: 'MP700 Pro 2TB',
    price: 1099,
    description: 'Jeden z pierwszych SSD PCIe 5.0 — prędkości do 12 GB/s. Dla platform obsługujących Gen 5.',
    specs: { Pojemność: '2 TB', Interfejs: 'NVMe PCIe 5.0 x4', Odczyt: '12400 MB/s', Zapis: '11800 MB/s', 'Format': 'M.2 2280', TBW: '1400 TB', Gwarancja: '5 lat' },
  },
];
