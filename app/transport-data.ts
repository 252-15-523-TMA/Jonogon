export interface TransportStation {
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
  departureTime?: string;
  fareFromStartBn?: string;
  fareFromStartEn?: string;
  amenitiesBn?: string[];
  amenitiesEn?: string[];
}

export interface TransportRoute {
  id: string;
  type: "metro" | "train" | "bus" | "intercity-bus" | "launch";
  typeLabelBn: string;
  typeLabelEn: string;
  titleBn: string;
  titleEn: string;
  code?: string;
  operatorBn: string;
  operatorEn: string;
  routeSummaryBn: string;
  routeSummaryEn: string;
  distanceKm: number;
  durationBn: string;
  durationEn: string;
  frequencyBn: string;
  frequencyEn: string;
  operatingHoursBn: string;
  operatingHoursEn: string;
  offDayBn?: string;
  offDayEn?: string;
  statusBn: string;
  statusEn: string;
  fareBreakdown: {
    classBn: string;
    classEn: string;
    fareBn: string;
    fareEn: string;
    noteBn?: string;
    noteEn?: string;
  }[];
  stations: TransportStation[];
  waypoints: [number, number][];
  sourceLinks: {
    labelBn: string;
    labelEn: string;
    url: string;
    primary?: boolean;
    badgeBn?: string;
    badgeEn?: string;
  }[];
  googleMapsDirectionsUrl?: string;
}

export const TRANSPORT_ROUTES: TransportRoute[] = [
  {
    id: "metro-line-6",
    type: "metro",
    typeLabelBn: "মেট্রোরেল",
    typeLabelEn: "Metro Rail",
    titleBn: "ঢাকা মেট্রোরেল এমআরটি লাইন-৬",
    titleEn: "Dhaka Metro Rail (MRT Line-6)",
    code: "MRT-6",
    operatorBn: "ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (DMTCL)",
    operatorEn: "Dhaka Mass Transit Company Limited (DMTCL)",
    routeSummaryBn: "উত্তরা উত্তর (দিয়াবাড়ী) ↔ মতিঝিল (১৬টি স্টেশন)",
    routeSummaryEn: "Uttara North (Diabari) ↔ Motijheel (16 Stations)",
    distanceKm: 20.1,
    durationBn: "৩২ মিনিট",
    durationEn: "32 mins",
    frequencyBn: "দিন ও সময়ভেদে ব্যবধান বদলায়; ডিএমটিসিএল-এর সময়সূচি দেখুন",
    frequencyEn: "Headways vary by day and time; see DMTCL's timetable",
    operatingHoursBn: "প্রকাশিত সময়সূচি: উত্তরা উত্তর থেকে ০৬:৩০–২১:৫০; মতিঝিল থেকে ০৭:১৫–২২:৩০। দিনভেদে ভিন্ন হতে পারে।",
    operatingHoursEn: "Published timetable: Uttara North 6:30 AM–9:50 PM; Motijheel 7:15 AM–10:30 PM. Day-specific schedules may vary.",
    offDayBn: "শুক্রবার ও সরকারি ছুটির সময়সূচি আলাদা; ডিএমটিসিএল-এর তালিকা দেখুন",
    offDayEn: "Friday and public-holiday schedules differ; check DMTCL's timetable",
    statusBn: "আজকের চলাচল ও নোটিশ ডিএমটিসিএল-এ যাচাই করুন",
    statusEn: "Check DMTCL for today's service notices",
    fareBreakdown: [
      { classBn: "সর্বনিম্ন একক যাত্রার ভাড়া", classEn: "Minimum single-journey fare", fareBn: "৳ ২০", fareEn: "৳ 20", noteBn: "ডিএমটিসিএল-এর প্রকাশিত তথ্য; দূরত্বভিত্তিক ভাড়া চার্টে দেখুন", noteEn: "DMTCL-published minimum; see its fare chart for station-to-station fares" },
      { classBn: "এমআরটি পাসে ভাড়ার ছাড়", classEn: "MRT Pass fare discount", fareBn: "১০%", fareEn: "10%", noteBn: "ডিএমটিসিএল-এর তথ্য; শর্ত যাচাই করুন", noteEn: "DMTCL-published; confirm current terms" },
    ],
    stations: [
      { nameBn: "উত্তরা উত্তর (দিয়াবাড়ী)", nameEn: "Uttara North", lat: 23.8759, lng: 90.3843, departureTime: "07:10 AM", fareFromStartBn: "৳ ২০", fareFromStartEn: "৳ 20", amenitiesBn: ["টিকিট ভেন্ডিং মেশিন", "রিমোট পাস রিচার্জ", "হুইলচেয়ার র‍্যাম্প"], amenitiesEn: ["TVM", "Rapid Pass Kiosk", "Wheelchair Ramp"] },
      { nameBn: "উত্তরা সেন্টার", nameEn: "Uttara Center", lat: 23.8645, lng: 90.3860, departureTime: "07:12 AM", fareFromStartBn: "৳ ২০", fareFromStartEn: "৳ 20" },
      { nameBn: "উত্তরা দক্ষিণ", nameEn: "Uttara South", lat: 23.8528, lng: 90.3882, departureTime: "07:15 AM", fareFromStartBn: "৳ ৩০", fareFromStartEn: "৳ 30" },
      { nameBn: "পল্লবী", nameEn: "Pallabi", lat: 23.8247, lng: 90.3644, departureTime: "07:18 AM", fareFromStartBn: "৳ ৩০", fareFromStartEn: "৳ 30" },
      { nameBn: "মিরপুর ১১", nameEn: "Mirpur 11", lat: 23.8164, lng: 90.3672, departureTime: "07:20 AM", fareFromStartBn: "৳ ৪০", fareFromStartEn: "৳ 40" },
      { nameBn: "মিরপুর ১০", nameEn: "Mirpur 10", lat: 23.8071, lng: 90.3688, departureTime: "07:23 AM", fareFromStartBn: "৳ ৪০", fareFromStartEn: "৳ 40", amenitiesBn: ["ইন্টারচেঞ্জ প্লাজা", "এসকেলেটর", "মেডিকেল ফার্স্ট এইড"], amenitiesEn: ["Interchange Plaza", "Escalator", "First Aid"] },
      { nameBn: "কাজীপাড়া", nameEn: "Kazipara", lat: 23.7975, lng: 90.3725, departureTime: "07:25 AM", fareFromStartBn: "৳ ৫০", fareFromStartEn: "৳ 50" },
      { nameBn: "শেওড়াপাড়া", nameEn: "Shewrapara", lat: 23.7892, lng: 90.3744, departureTime: "07:27 AM", fareFromStartBn: "৳ ৫০", fareFromStartEn: "৳ 50" },
      { nameBn: "আগারগাঁও", nameEn: "Agargaon", lat: 23.7780, lng: 90.3770, departureTime: "07:30 AM", fareFromStartBn: "৳ ৬০", fareFromStartEn: "৳ 60" },
      { nameBn: "বিজয় সরণি", nameEn: "Bijoy Sarani", lat: 23.7661, lng: 90.3871, departureTime: "07:32 AM", fareFromStartBn: "৳ ৬০", fareFromStartEn: "৳ 60" },
      { nameBn: "ফার্মগেট", nameEn: "Farmgate", lat: 23.7571, lng: 90.3908, departureTime: "07:35 AM", fareFromStartBn: "৳ ৭০", fareFromStartEn: "৳ 70", amenitiesBn: ["এলিভেটেড ফুটওভার কানেক্টর", "এটিএম বুথ"], amenitiesEn: ["Elevated Footbridge", "ATM Kiosk"] },
      { nameBn: "কারওয়ান বাজার", nameEn: "Karwan Bazar", lat: 23.7511, lng: 90.3934, departureTime: "07:37 AM", fareFromStartBn: "৳ ৮০", fareFromStartEn: "৳ 80" },
      { nameBn: "শাহবাগ", nameEn: "Shahbagh", lat: 23.7388, lng: 90.3960, departureTime: "07:40 AM", fareFromStartBn: "৳ ৮০", fareFromStartEn: "৳ 80" },
      { nameBn: "ঢাকা বিশ্ববিদ্যালয়", nameEn: "Dhaka University", lat: 23.7314, lng: 90.3986, departureTime: "07:42 AM", fareFromStartBn: "৳ ৯০", fareFromStartEn: "৳ 90" },
      { nameBn: "বাংলাদেশ সচিবালয়", nameEn: "Bangladesh Secretariat", lat: 23.7292, lng: 90.4074, departureTime: "07:44 AM", fareFromStartBn: "৳ ৯০", fareFromStartEn: "৳ 90" },
      { nameBn: "মতিঝিল", nameEn: "Motijheel", lat: 23.7330, lng: 90.4172, departureTime: "07:47 AM", fareFromStartBn: "৳ ১০০", fareFromStartEn: "৳ 100", amenitiesBn: ["কমলাপুর সম্প্রসারণ সংযোগ", "প্রস্থান প্লাজা"], amenitiesEn: ["Kamalapur Link", "Exit Plaza"] },
    ],
    waypoints: [
      [23.8759, 90.3843],
      [23.8645, 90.3860],
      [23.8528, 90.3882],
      [23.8247, 90.3644],
      [23.8164, 90.3672],
      [23.8071, 90.3688],
      [23.7975, 90.3725],
      [23.7892, 90.3744],
      [23.7780, 90.3770],
      [23.7661, 90.3871],
      [23.7571, 90.3908],
      [23.7511, 90.3934],
      [23.7388, 90.3960],
      [23.7314, 90.3986],
      [23.7292, 90.4074],
      [23.7330, 90.4172],
    ],
    sourceLinks: [
      { labelBn: "ডিএমটিসিএল-এর সময়সূচি", labelEn: "DMTCL Published Timetable", url: "https://dmtcl.gov.bd/pages/static-pages/6922df5f933eb65569e218ed", primary: true, badgeBn: "সময়সূচি", badgeEn: "Timetable" },
      { labelBn: "সরকারি ভাড়ার তালিকা", labelEn: "Official Fare Chart", url: "https://dmtcl.gov.bd/pages/static-pages/6922df5a933eb65569e2169f", badgeBn: "ভাড়া", badgeEn: "Fares" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.8759,90.3843&destination=23.7330,90.4172&travelmode=transit",
  },
  {
    id: "train-suborno-express",
    type: "train",
    typeLabelBn: "আন্তঃনগর ট্রেন",
    typeLabelEn: "Intercity Train",
    titleBn: "সুবর্ণ এক্সপ্রেস (৭০১/৭০২)",
    titleEn: "Suborno Express (701/702)",
    code: "701/702",
    operatorBn: "বাংলাদেশ রেলওয়ে (পূর্বাঞ্চল)",
    operatorEn: "Bangladesh Railway (Eastern Zone)",
    routeSummaryBn: "ঢাকা (কমলাপুর) ↔ চট্টগ্রাম (নন-স্টপ প্রিমিয়াম এক্সপ্রেস)",
    routeSummaryEn: "Dhaka (Kamalapur) ↔ Chattogram (Non-stop Premium Express)",
    distanceKm: 320,
    durationBn: "নির্বাচিত ট্রেনের সময়সূচি দেখুন",
    durationEn: "Check the selected train's timetable",
    frequencyBn: "তারিখ ও সাপ্তাহিক বন্ধের দিন সরকারি সময়সূচিতে যাচাই করুন",
    frequencyEn: "Check the official timetable for date and weekly off-day",
    operatingHoursBn: "ছাড়ার ও পৌঁছানোর সময় যাত্রার তারিখ দিয়ে রেলওয়ে ই-টিকিটে দেখুন",
    operatingHoursEn: "Check departure and arrival times for your travel date on Railway e-ticketing",
    offDayBn: "সাপ্তাহিক বন্ধের দিন পরিবর্তিত হতে পারে; সময়সূচি যাচাই করুন",
    offDayEn: "Weekly off-days can change; confirm in the timetable",
    statusBn: "সেবা ও আসনের বর্তমান অবস্থা বাংলাদেশ রেলওয়েতে যাচাই করুন",
    statusEn: "Check current service and seat availability with Bangladesh Railway",
    fareBreakdown: [
      { classBn: "তারিখ ও শ্রেণিভিত্তিক টিকিট ভাড়া", classEn: "Fare by travel date and seat class", fareBn: "ই-টিকিটে দেখুন", fareEn: "Check e-ticket", noteBn: "সিট ও যাত্রার তারিখ অনুযায়ী ভাড়া ও প্রাপ্যতা বদলায়", noteEn: "Fare and availability depend on travel date and seat class" },
    ],
    stations: [
      { nameBn: "ঢাকা কমলাপুর রেলওয়ে স্টেশন", nameEn: "Dhaka Kamalapur Railway Station", lat: 23.7317, lng: 90.4267, departureTime: "04:30 PM", fareFromStartBn: "—", fareFromStartEn: "—", amenitiesBn: ["ই-টিকিট স্ক্যানার", "ভিআইপি লাউঞ্জ", "ক্যাফেটেরিয়া"], amenitiesEn: ["E-Ticket Kiosk", "VIP Lounge", "Food Court"] },
      { nameBn: "ঢাকা বিমানবন্দর স্টেশন", nameEn: "Dhaka Airport Station", lat: 23.8513, lng: 90.4080, departureTime: "05:02 PM", fareFromStartBn: "৳ ৫০", fareFromStartEn: "৳ 50" },
      { nameBn: "টঙ্গী জংশন (থ্রু পাস)", nameEn: "Tongi Junction", lat: 23.8966, lng: 90.4022, departureTime: "05:15 PM" },
      { nameBn: "ভৈরব বাজার জংশন (থ্রু পাস)", nameEn: "Bhairab Bazar Junction", lat: 24.0506, lng: 90.9856, departureTime: "06:12 PM" },
      { nameBn: "ব্রাহ্মণবাড়িয়া", nameEn: "Brahmanbaria", lat: 23.9608, lng: 91.1115, departureTime: "06:40 PM" },
      { nameBn: "আখাউড়া জংশন (থ্রু পাস)", nameEn: "Akhaura Junction", lat: 23.8710, lng: 91.2144, departureTime: "07:05 PM" },
      { nameBn: "ফেনী জংশন (থ্রু পাস)", nameEn: "Feni Junction", lat: 23.0159, lng: 91.3976, departureTime: "08:15 PM" },
      { nameBn: "চট্টগ্রাম রেলওয়ে স্টেশন", nameEn: "Chattogram Railway Station", lat: 22.3353, lng: 91.8325, departureTime: "09:45 PM", fareFromStartBn: "৳ ৪০৫ - ৳ ৭৭৭", fareFromStartEn: "৳ 405 - ৳ 777", amenitiesBn: ["ট্যাক্সি স্ট্যান্ড", "ওয়েটিং লাউঞ্জ"], amenitiesEn: ["Taxi Stand", "Waiting Lounge"] },
    ],
    waypoints: [
      [23.7317, 90.4267],
      [23.8513, 90.4080],
      [23.8966, 90.4022],
      [24.0506, 90.9856],
      [23.9608, 91.1115],
      [23.8710, 91.2144],
      [23.0159, 91.3976],
      [22.3353, 91.8325],
    ],
    sourceLinks: [
      { labelBn: "বাংলাদেশ রেলওয়ের সময়সূচি", labelEn: "Bangladesh Railway Timetables", url: "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2", primary: true, badgeBn: "সময়সূচি", badgeEn: "Timetable" },
      { labelBn: "তারিখভিত্তিক টিকিট ও ভাড়া", labelEn: "Date-specific tickets and fares", url: "https://eticket.railway.gov.bd", badgeBn: "ই-টিকিট", badgeEn: "E-ticket" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7317,90.4267&destination=22.3353,91.8325&travelmode=transit",
  },
  {
    id: "train-cox-express",
    type: "train",
    typeLabelBn: "আইকনিক সুপারফাস্ট ট্রেন",
    typeLabelEn: "Iconic Superfast Express",
    titleBn: "কক্সবাজার এক্সপ্রেস (৮১৩/৮১৪)",
    titleEn: "Cox's Bazar Express (813/814)",
    code: "813/814",
    operatorBn: "বাংলাদেশ রেলওয়ে (দোহাজারী-কক্সবাজার স্পেশাল)",
    operatorEn: "Bangladesh Railway (Dohazari-Cox's Bazar Line)",
    routeSummaryBn: "ঢাকা (কমলাপুর) ↔ চট্টগ্রাম ↔ কক্সবাজার আইকনিক স্টেশন",
    routeSummaryEn: "Dhaka (Kamalapur) ↔ Chattogram ↔ Cox's Bazar Iconic Station",
    distanceKm: 440,
    durationBn: "নির্বাচিত ট্রেনের সময়সূচি দেখুন",
    durationEn: "Check the selected train's timetable",
    frequencyBn: "তারিখ ও সাপ্তাহিক বন্ধের দিন সরকারি সময়সূচিতে যাচাই করুন",
    frequencyEn: "Check the official timetable for date and weekly off-day",
    operatingHoursBn: "ছাড়ার ও পৌঁছানোর সময় যাত্রার তারিখ দিয়ে রেলওয়ে ই-টিকিটে দেখুন",
    operatingHoursEn: "Check departure and arrival times for your travel date on Railway e-ticketing",
    offDayBn: "সাপ্তাহিক বন্ধের দিন পরিবর্তিত হতে পারে; সময়সূচি যাচাই করুন",
    offDayEn: "Weekly off-days can change; confirm in the timetable",
    statusBn: "সেবা ও আসনের বর্তমান অবস্থা বাংলাদেশ রেলওয়েতে যাচাই করুন",
    statusEn: "Check current service and seat availability with Bangladesh Railway",
    fareBreakdown: [
      { classBn: "তারিখ ও শ্রেণিভিত্তিক টিকিট ভাড়া", classEn: "Fare by travel date and seat class", fareBn: "ই-টিকিটে দেখুন", fareEn: "Check e-ticket", noteBn: "সিট ও যাত্রার তারিখ অনুযায়ী ভাড়া ও প্রাপ্যতা বদলায়", noteEn: "Fare and availability depend on travel date and seat class" },
    ],
    stations: [
      { nameBn: "ঢাকা কমলাপুর স্টেশন", nameEn: "Dhaka Kamalapur", lat: 23.7317, lng: 90.4267, departureTime: "10:30 PM" },
      { nameBn: "ঢাকা বিমানবন্দর", nameEn: "Dhaka Airport", lat: 23.8513, lng: 90.4080, departureTime: "11:00 PM" },
      { nameBn: "চট্টগ্রাম স্টেশন", nameEn: "Chattogram Station", lat: 22.3353, lng: 91.8325, departureTime: "03:40 AM" },
      { nameBn: "দোহাজারী জংশন", nameEn: "Dohazari Junction", lat: 22.1645, lng: 92.0620, departureTime: "04:45 AM" },
      { nameBn: "কক্সবাজার ঝিনুক আকৃতির আইকনিক স্টেশন", nameEn: "Cox's Bazar Iconic Oyster Station", lat: 21.4339, lng: 91.9864, departureTime: "06:40 AM", amenitiesBn: ["আন্তর্জাতিক মানের লাউঞ্জ", "হোটেল বুকিং ডেস্ক", "ট্যুরিস্ট হেল্পলাইন"], amenitiesEn: ["International Lounge", "Hotel Desk", "Tourist Helpline"] },
    ],
    waypoints: [
      [23.7317, 90.4267],
      [23.8513, 90.4080],
      [22.3353, 91.8325],
      [22.1645, 92.0620],
      [21.4339, 91.9864],
    ],
    sourceLinks: [
      { labelBn: "বাংলাদেশ রেলওয়ের সময়সূচি", labelEn: "Bangladesh Railway Timetables", url: "https://railway.gov.bd/pages/static-pages/691997d5933eb65569ddf8e2", primary: true, badgeBn: "সময়সূচি", badgeEn: "Timetable" },
      { labelBn: "তারিখভিত্তিক টিকিট ও ভাড়া", labelEn: "Date-specific tickets and fares", url: "https://eticket.railway.gov.bd", badgeBn: "ই-টিকিট", badgeEn: "E-ticket" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7317,90.4267&destination=21.4339,91.9864&travelmode=transit",
  },
  {
    id: "bus-dhaka-nagar-paribahan",
    type: "bus",
    typeLabelBn: "নগর বাস সার্ভিস",
    typeLabelEn: "City Bus Service",
    titleBn: "ঢাকা নগর পরিবহন (ঘাটারচর–কাঁচপুর)",
    titleEn: "Dhaka Nagar Paribahan (Ghatar Char–Kanchpur)",
    code: "BRTC",
    operatorBn: "বাংলাদেশ সড়ক পরিবহন কর্পোরেশন (বিআরটিসি)",
    operatorEn: "Bangladesh Road Transport Corporation (BRTC)",
    routeSummaryBn: "ঘাটারচর ↔ কাঁচপুর (বিআরটিসি প্রকাশিত নগর পরিবহন রুট)",
    routeSummaryEn: "Ghatar Char ↔ Kanchpur (BRTC-published city bus route)",
    distanceKm: 27.5,
    durationBn: "যানজটভেদে বদলায়; মানচিত্রে দেখুন",
    durationEn: "Traffic-dependent; check the map",
    frequencyBn: "বিআরটিসি প্রকাশিত তথ্য: ঘাটারচর থেকে প্রতি ১৫ মিনিটে",
    frequencyEn: "BRTC published service: every 15 minutes from Ghatar Char",
    operatingHoursBn: "বিআরটিসি প্রকাশিত সময়: সকাল ৭:১০–সন্ধ্যা ৬:০০; যাত্রার আগে যাচাই করুন",
    operatingHoursEn: "BRTC published hours: 7:10 AM–6:00 PM; confirm before travel",
    statusBn: "আজকের চলাচল বিআরটিসি-তে যাচাই করুন",
    statusEn: "Check BRTC for today's service status",
    fareBreakdown: [
      { classBn: "ঘাটারচর–কাঁচপুর (বিআরটিসি প্রকাশিত ভাড়া)", classEn: "Ghatar Char–Kanchpur (BRTC published fare)", fareBn: "৳ ৬৫", fareEn: "৳ 65", noteBn: "২৭.৫ কিমি; ভাড়া/সেবা পরিবর্তিত হলে বিআরটিসির তালিকা অনুসরণ করুন", noteEn: "27.5 km; follow BRTC's current listing if fares or service change" },
    ],
    stations: [
      { nameBn: "ঘাটারচর", nameEn: "Ghatar Char", lat: 23.7358, lng: 90.33455 },
      { nameBn: "কাঁচপুর বাস স্ট্যান্ড", nameEn: "Kanchpur Bus Stand", lat: 23.70584, lng: 90.52174 },
    ],
    waypoints: [
      [23.7358, 90.33455],
      [23.70584, 90.52174],
    ],
    sourceLinks: [
      { labelBn: "বিআরটিসি রুট, সময় ও ভাড়া", labelEn: "BRTC Routes, Timetables & Fares", url: "https://brtc.gov.bd/pages/static-pages/6922e0e1933eb65569e29008", primary: true, badgeBn: "সরকারি উৎস", badgeEn: "Official source" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7358,90.33455&destination=23.70584,90.52174&travelmode=transit",
  },
  {
    id: "intercity-green-line",
    type: "intercity-bus",
    typeLabelBn: "দূরপাল্লার আন্তঃজেলা বাস",
    typeLabelEn: "Inter-District Long Route Bus",
    titleBn: "গ্রিন লাইন আন্তঃজেলা বাস",
    titleEn: "Green Line Intercity Bus",
    code: "GL-EXP",
    operatorBn: "গ্রিন লাইন পরিবহন",
    operatorEn: "Green Line Paribahan",
    routeSummaryBn: "ঢাকা ↔ চট্টগ্রাম বা কক্সবাজার (অপারেটর পোর্টালে নির্দিষ্ট গন্তব্য বেছে নিন)",
    routeSummaryEn: "Dhaka ↔ Chattogram or Cox's Bazar (choose the exact trip on the operator site)",
    distanceKm: 395,
    durationBn: "ট্রিপ ও যানজটভেদে বদলায়; বুকিংয়ে দেখুন",
    durationEn: "Varies by trip and traffic; check booking details",
    frequencyBn: "অপারেটরের লাইভ ট্রিপ তালিকায় দেখুন",
    frequencyEn: "Check the operator's current trip listing",
    operatingHoursBn: "নির্বাচিত যাত্রার ছাড়ার সময় অপারেটরের সাইটে দেখুন",
    operatingHoursEn: "Check the selected departure time on the operator's site",
    statusBn: "আসন, সময় ও ভাড়া অপারেটরের বুকিং পোর্টালে যাচাই করুন",
    statusEn: "Check seats, times and fares in the operator's booking portal",
    fareBreakdown: [
      { classBn: "বর্তমান ভাড়া ও আসন", classEn: "Current fares and seats", fareBn: "অপারেটরের সাইটে দেখুন", fareEn: "Check operator site", noteBn: "গন্তব্য, বাস ও তারিখভেদে ভাড়া বদলায়", noteEn: "Fares vary by destination, coach and date" },
    ],
    stations: [
      { nameBn: "ঢাকা রাজারবাগ / আরামবাগ কাউন্টার", nameEn: "Dhaka Rajarbagh / Arambagh Counter", lat: 23.7320, lng: 90.4190, departureTime: "10:30 PM" },
      { nameBn: "কাঁচপুর ব্রিজ টোল প্লাজা", nameEn: "Kanchpur Toll Plaza", lat: 23.7050, lng: 90.5280, departureTime: "11:15 PM" },
      { nameBn: "কুমিল্লা পদুয়ার বাজার বিশ্বরোড (হাইওয়ে বিরতি)", nameEn: "Cumilla Paduar Bazar Highway Stop", lat: 23.4190, lng: 91.1760, departureTime: "01:30 AM" },
      { nameBn: "ফেনী মহিপাল মোড়", nameEn: "Feni Mohipal Crossing", lat: 23.0159, lng: 91.3976, departureTime: "02:45 AM" },
      { nameBn: "চট্টগ্রাম দামপাড়া কাউন্টার", nameEn: "Chattogram Dampara Counter", lat: 22.3569, lng: 91.8210, departureTime: "04:15 AM" },
      { nameBn: "কক্সবাজার ঝাউতলা / কলাতলী কাউন্টার", nameEn: "Cox's Bazar Jhawtola / Kolatoli", lat: 21.4339, lng: 91.9750, departureTime: "06:45 AM" },
    ],
    waypoints: [
      [23.7320, 90.4190],
      [23.7050, 90.5280],
      [23.4190, 91.1760],
      [23.0159, 91.3976],
      [22.3569, 91.8210],
      [21.4339, 91.9750],
    ],
    sourceLinks: [
      { labelBn: "গ্রিন লাইন পরিবহন: ট্রিপ ও টিকিট", labelEn: "Green Line: trips and tickets", url: "https://greenlinebd.com/", primary: true, badgeBn: "অপারেটর", badgeEn: "Operator" },
      { labelBn: "অন্যান্য বাসের টিকিট খুঁজুন", labelEn: "Search tickets from other bus operators", url: "https://www.shohoz.com/bus-tickets" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7320,90.4190&destination=21.4339,91.9750&travelmode=driving",
  },
  {
    id: "launch-dhaka-barishal",
    type: "launch",
    typeLabelBn: "নৌপথ / যাত্রীবাহী লঞ্চ",
    typeLabelEn: "Inland Waterway / Passenger Launch",
    titleBn: "ঢাকা সদরঘাট–বরিশাল নৌপথ",
    titleEn: "Dhaka Sadarghat–Barishal Waterway",
    code: "INLAND WATERWAY",
    operatorBn: "নৌপথের যাত্রীবাহী লঞ্চ অপারেটর",
    operatorEn: "Passenger launch operators on this route",
    routeSummaryBn: "ঢাকা সদরঘাট ↔ বরিশাল (অন্তর্বর্তী ঘাট/জাহাজ যাত্রাভেদে বদলায়)",
    routeSummaryEn: "Dhaka Sadarghat ↔ Barishal (intermediate stops and vessels vary by trip)",
    distanceKm: 170,
    durationBn: "জাহাজ ও আবহাওয়াভেদে বদলায়; অপারেটরের কাছে যাচাই করুন",
    durationEn: "Varies by vessel and conditions; confirm with the operator",
    frequencyBn: "জাহাজ ও ছাড়ার সময় BIWTC/টার্মিনালে যাচাই করুন",
    frequencyEn: "Check vessel and departure time with BIWTC or the terminal",
    operatingHoursBn: "প্রতিটি যাত্রার সময়সূচি অপারেটর/টার্মিনালে যাচাই করুন",
    operatingHoursEn: "Confirm each sailing's timetable with the operator or terminal",
    statusBn: "আজকের যাত্রা, আসন ও ভাড়া BIWTC/BIWTA-তে যাচাই করুন",
    statusEn: "Check today's sailing, seats and fare with BIWTC/BIWTA",
    fareBreakdown: [
      { classBn: "যাত্রীভাড়া তালিকা", classEn: "Passenger fare schedule", fareBn: "বিআইডব্লিউটিএ-তে দেখুন", fareEn: "Check BIWTA schedule", noteBn: "গন্তব্য ও শ্রেণিভেদে নির্ধারিত ভাড়া দেখুন", noteEn: "Check regulated fares by route and class" },
    ],
    stations: [
      { nameBn: "ঢাকা সদরঘাট লঞ্চ টার্মিনাল", nameEn: "Dhaka Sadarghat Launch Terminal", lat: 23.7042, lng: 90.4132, departureTime: "08:30 PM", amenitiesBn: ["পন্টুন ব্রিজ", "নিরাপত্তা আর্চওয়ে", "টিকিট কাউন্টার"], amenitiesEn: ["Pontoon Bridge", "Security Arch", "Ticket Counters"] },
      { nameBn: "চাঁদপুর মেঘনা মোহনা সংযোগ", nameEn: "Chandpur Meghna Estuary", lat: 23.2321, lng: 90.6631, departureTime: "11:45 PM" },
      { nameBn: "মেহেন্দিগঞ্জ টার্মিনাল (অন-ডিমান্ড)", nameEn: "Mehendiganj Point", lat: 22.8250, lng: 90.5310, departureTime: "02:30 AM" },
      { nameBn: "কীর্তনখোলা চ্যানেল", nameEn: "Kirtankhola Channel", lat: 22.7210, lng: 90.3750, departureTime: "04:10 AM" },
      { nameBn: "বরিশাল লঞ্চ ঘাট (টার্মিনাল)", nameEn: "Barishal Launch Ghat", lat: 22.7010, lng: 90.3535, departureTime: "04:45 AM", amenitiesBn: ["অটোরিকশা স্ট্যান্ড", "নৌ পুলিশ ফাঁড়ি"], amenitiesEn: ["Auto Stand", "River Police Outpost"] },
    ],
    waypoints: [
      [23.7042, 90.4132],
      [23.2321, 90.6631],
      [22.8250, 90.5310],
      [22.7210, 90.3750],
      [22.7010, 90.3535],
    ],
    sourceLinks: [
      { labelBn: "বিআইডব্লিউটিএ যাত্রীভাড়া তালিকা", labelEn: "BIWTA Passenger Fare Schedules", url: "https://biwta.gov.bd/pages/static-pages/6922dc80933eb65569e10b43", primary: true, badgeBn: "ভাড়ার তালিকা", badgeEn: "Fare schedule" },
      { labelBn: "বিআইডব্লিউটিসি যাত্রী সময়সূচি ও বুকিং", labelEn: "BIWTC passenger schedules and booking", url: "https://biwtc.gov.bd/", badgeBn: "অপারেটর", badgeEn: "Operator" },
    ],
  },
];
