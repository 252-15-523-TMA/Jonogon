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
  officialLinks: {
    labelBn: string;
    labelEn: string;
    url: string;
    primary?: boolean;
    badgeBn?: string;
    badgeEn?: string;
  }[];
  googleMapsDirectionsUrl: string;
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
    frequencyBn: "পিক আওয়ারে প্রতি ৮ মিনিট পর পর, স্বাভাবিক সময়ে ১০-১২ মিনিট",
    frequencyEn: "Every 8 mins in peak hours; 10-12 mins regular",
    operatingHoursBn: "সকাল ৭:১০ - রাত ৯:৪০ (শনি থেকে বৃহস্পতি; শুক্রবার বিকেলে সীমিত)",
    operatingHoursEn: "7:10 AM - 9:40 PM (Sat-Thu; Fri afternoon service)",
    offDayBn: "শুক্রবারে দুপুর ৩:৩০ থেকে চলাচল শুরু",
    offDayEn: "Friday services start from 3:30 PM",
    statusBn: "স্বাভাবিক ও সময়মতো চলছে",
    statusEn: "Running On Schedule",
    fareBreakdown: [
      { classBn: "সর্বনিম্ন ভাড়া", classEn: "Minimum Fare", fareBn: "৳ ২০", fareEn: "৳ 20", noteBn: "পরবর্তী স্টপেজ", noteEn: "Next stoppage" },
      { classBn: "উত্তরা উত্তর থেকে ফার্মগেট", classEn: "Uttara North to Farmgate", fareBn: "৳ ৭০", fareEn: "৳ 70" },
      { classBn: "সম্পূর্ণ রুট (উত্তরা - মতিঝিল)", classEn: "Full Route (Uttara - Motijheel)", fareBn: "৳ ১০০", fareEn: "৳ 100", noteBn: "সর্বোচ্চ ভাড়া", noteEn: "Maximum fare" },
      { classBn: "র‍্যাপিড পাস / এমআরটি পাস ডিসকাউন্ট", classEn: "Rapid Pass / MRT Pass Discount", fareBn: "১০% ছাড়", fareEn: "10% Off", noteBn: "প্রতি যাত্রায় স্বয়ংক্রিয় রিবেট", noteEn: "Automatic rebate per ride" },
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
    officialLinks: [
      { labelBn: "ডিএমটিসিএল অফিসিয়াল ওয়েবসাইট", labelEn: "DMTCL Official Portal", url: "https://dmtcl.gov.bd", primary: true, badgeBn: "অফিসিয়াল", badgeEn: "Official" },
      { labelBn: "র‍্যাপিড পাস কার্ড নিবন্ধন", labelEn: "Rapid Pass Registration", url: "https://rapidpass.com.bd", badgeBn: "১০% ছাড়", badgeEn: "10% Discount" },
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
    durationBn: "৫ ঘণ্টা ১৫ মিনিট",
    durationEn: "5 hrs 15 mins",
    frequencyBn: "প্রতিদিন (সোমবারে বন্ধ)",
    frequencyEn: "Daily (Except Monday)",
    operatingHoursBn: "ঢাকা ছাড়ে: বিকাল ৪:৩০ (চট্টগ্রাম পৌঁছে রাত ৯:৪৫) | চট্টগ্রাম ছাড়ে: সকাল ৭:০০",
    operatingHoursEn: "Departs Dhaka: 4:30 PM (Arrives 9:45 PM) | Departs Ctg: 7:00 AM",
    offDayBn: "সোমবার সাপ্তাহিক ছুটি",
    offDayEn: "Closed on Mondays",
    statusBn: "সময়সূচি অনুসারে চলমান",
    statusEn: "Running On Time",
    fareBreakdown: [
      { classBn: "শোভন চেয়ার (নন-এসি)", classEn: "Shovon Chair (Non-AC)", fareBn: "৳ ৪০৫", fareEn: "৳ 405" },
      { classBn: "স্নিগ্ধা (এসি চেয়ার)", classEn: "Snigdha (AC Chair)", fareBn: "৳ ৭৭৭", fareEn: "৳ 777" },
      { classBn: "এসি বার্থ / কেবিন", classEn: "AC Berth / Cabin", fareBn: "৳ ১,৩৮৬", fareEn: "৳ 1,386" },
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
    officialLinks: [
      { labelBn: "রেলওয়ে অফিসিয়াল ই-টিকিট পোর্টাল", labelEn: "Bangladesh Railway E-Ticket Portal", url: "https://eticket.railway.gov.bd", primary: true, badgeBn: "অনলাইন টিকিট", badgeEn: "Book Online" },
      { labelBn: "বাংলাদেশ রেলওয়ে তথ্য বাতায়ন", labelEn: "Railway Portal Information", url: "https://railway.gov.bd" },
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
    durationBn: "৮ ঘণ্টা ১০ মিনিট",
    durationEn: "8 hrs 10 mins",
    frequencyBn: "প্রতিদিন চলাচল করে (মঙ্গলবার ছুটি)",
    frequencyEn: "Daily Service (Closed on Tuesdays)",
    operatingHoursBn: "ঢাকা ছাড়ে: রাত ১০:৩০ (কক্সবাজার পৌঁছে সকাল ৬:৪০) | কক্সবাজার ছাড়ে: দুপুর ১২:৩০",
    operatingHoursEn: "Departs Dhaka: 10:30 PM (Arrives 6:40 AM) | Departs Cox's: 12:30 PM",
    offDayBn: "মঙ্গলবার বন্ধ",
    offDayEn: "Closed on Tuesday",
    statusBn: "অত্যন্ত উচ্চ চাহিদা (অগ্রিম টিকিট সুপারিশকৃত)",
    statusEn: "High Demand (Advance booking recommended)",
    fareBreakdown: [
      { classBn: "শোভন চেয়ার (নন-এসি)", classEn: "Shovon Chair (Non-AC)", fareBn: "৳ ৬৯৫", fareEn: "৳ 695" },
      { classBn: "স্নিগ্ধা (এসি চেয়ার)", classEn: "Snigdha (AC Chair)", fareBn: "৳ ১,৩২৫", fareEn: "৳ 1,325" },
      { classBn: "এসি সিট (প্রথম শ্রেণি)", classEn: "AC First Class Seat", fareBn: "৳ ১,৫৯০", fareEn: "৳ 1,590" },
      { classBn: "এসি বার্থ / কেবিন স্লিপার", classEn: "AC Berth / Sleeper Cabin", fareBn: "৳ ২,৩৮০", fareEn: "৳ 2,380" },
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
    officialLinks: [
      { labelBn: "রেলওয়ে ই-টিকিট বুকিং (eticket.railway.gov.bd)", labelEn: "E-Ticket Online Booking", url: "https://eticket.railway.gov.bd", primary: true, badgeBn: "অনলাইন রিজার্ভেশন", badgeEn: "Reserve Online" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7317,90.4267&destination=21.4339,91.9864&travelmode=transit",
  },
  {
    id: "bus-brtc-airport-express",
    type: "bus",
    typeLabelBn: "নগর বাস সার্ভিস",
    typeLabelEn: "City Bus Service",
    titleBn: "বিআরটিসি বিমানবন্দর এসি বাস সার্ভিস",
    titleEn: "BRTC Airport AC Express Bus",
    code: "BRTC-AC-1",
    operatorBn: "বাংলাদেশ সড়ক পরিবহন কর্পোরেশন (বিআরটিসি)",
    operatorEn: "Bangladesh Road Transport Corporation (BRTC)",
    routeSummaryBn: "হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর ↔ মতিঝিল / গুলিস্তান",
    routeSummaryEn: "Hazrat Shahjalal Int'l Airport ↔ Motijheel / Gulistan",
    distanceKm: 18.5,
    durationBn: "৫০ - ৭০ মিনিট (ট্রাফিক সাপেক্ষে)",
    durationEn: "50 - 70 mins (Traffic dependent)",
    frequencyBn: "প্রতি ১২ থেকে ১৫ মিনিট পরপর",
    frequencyEn: "Every 12 to 15 mins",
    operatingHoursBn: "সকাল ৬:০০ - রাত ১০:৩০",
    operatingHoursEn: "6:00 AM - 10:30 PM",
    statusBn: "পিক আওয়ারে অতিরিক্ত বাস চালু",
    statusEn: "Extra Buses on Peak Hours",
    fareBreakdown: [
      { classBn: "বিমানবন্দর থেকে বনানী", classEn: "Airport to Banani", fareBn: "৳ ৫০", fareEn: "৳ 50" },
      { classBn: "বিমানবন্দর থেকে ফার্মগেট", classEn: "Airport to Farmgate", fareBn: "৳ ৭০", fareEn: "৳ 70" },
      { classBn: "বিমানবন্দর থেকে শাহবাগ / প্রেসক্লাব", classEn: "Airport to Shahbagh / Press Club", fareBn: "৳ ৯০", fareEn: "৳ 90" },
      { classBn: "বিমানবন্দর থেকে মতিঝিল (সম্পূর্ণ রুট)", classEn: "Airport to Motijheel (Full Route)", fareBn: "৳ ১০০", fareEn: "৳ 100" },
    ],
    stations: [
      { nameBn: "বিমানবন্দর টার্মিনাল ১ ও ২", nameEn: "Airport Terminal 1 & 2", lat: 23.8513, lng: 90.4080, departureTime: "06:00 AM" },
      { nameBn: "খিলক্ষেত বাস স্টপ", nameEn: "Khilkhet Bus Stop", lat: 23.8315, lng: 90.4245, departureTime: "06:12 AM" },
      { nameBn: "বনানী কাকলী মোড়", nameEn: "Banani Kakoli Crossing", lat: 23.7937, lng: 90.4066, departureTime: "06:25 AM" },
      { nameBn: "মহাখালী বাস টার্মিনাল", nameEn: "Mohakhali Bus Terminal", lat: 23.7777, lng: 90.4005, departureTime: "06:35 AM" },
      { nameBn: "ফার্মগেট পুলিশ বক্স", nameEn: "Farmgate Police Box", lat: 23.7571, lng: 90.3908, departureTime: "06:48 AM" },
      { nameBn: "শাহবাগ মোড়", nameEn: "Shahbagh Intersection", lat: 23.7388, lng: 90.3960, departureTime: "06:58 AM" },
      { nameBn: "জাতীয় প্রেসক্লাব", nameEn: "National Press Club", lat: 23.7310, lng: 90.4080, departureTime: "07:05 AM" },
      { nameBn: "মতিঝিল শাপলা চত্বর", nameEn: "Motijheel Shapla Chattar", lat: 23.7330, lng: 90.4172, departureTime: "07:12 AM" },
    ],
    waypoints: [
      [23.8513, 90.4080],
      [23.8315, 90.4245],
      [23.7937, 90.4066],
      [23.7777, 90.4005],
      [23.7571, 90.3908],
      [23.7388, 90.3960],
      [23.7310, 90.4080],
      [23.7330, 90.4172],
    ],
    officialLinks: [
      { labelBn: "বিআরটিএ অনুমোদিত ভাড়ার চার্ট", labelEn: "BRTA Official Fare Chart", url: "https://brta.gov.bd", primary: true, badgeBn: "সরকারি রেট", badgeEn: "Govt Rate" },
      { labelBn: "বিআরটিসি পরিবহন ওয়েবসাইট", labelEn: "BRTC Official Website", url: "https://brtc.gov.bd" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.8513,90.4080&destination=23.7330,90.4172&travelmode=transit",
  },
  {
    id: "intercity-green-line",
    type: "intercity-bus",
    typeLabelBn: "দূরপাল্লার আন্তঃজেলা বাস",
    typeLabelEn: "Inter-District Long Route Bus",
    titleBn: "গ্রিন লাইন স্ক্যানিয়া / স্লিপার কোচ",
    titleEn: "Green Line Scania / Sleeper Coach",
    code: "GL-EXP",
    operatorBn: "গ্রিন লাইন পরিবহন",
    operatorEn: "Green Line Paribahan",
    routeSummaryBn: "ঢাকা (আরামবাগ / রাজারবাগ) ↔ চট্টগ্রাম ↔ কক্সবাজার",
    routeSummaryEn: "Dhaka (Arambagh / Rajarbagh) ↔ Chattogram ↔ Cox's Bazar",
    distanceKm: 395,
    durationBn: "৭ ঘণ্টা ৩০ মিনিট - ৮ ঘণ্টা",
    durationEn: "7 hrs 30 mins - 8 hrs",
    frequencyBn: "সকাল ৭:০০, সকাল ১০:০০, রাত ৮:০০, ১০:৩০, ১১:৩০",
    frequencyEn: "7:00 AM, 10:00 AM, 8:00 PM, 10:30 PM, 11:30 PM",
    operatingHoursBn: "২৪ ঘণ্টা কাউন্টার সেবা",
    operatingHoursEn: "24-Hour Counter Support",
    statusBn: "নিয়মিত শীতাতপ নিয়ন্ত্রিত ট্রিপ চলমান",
    statusEn: "Regular AC Trips Active",
    fareBreakdown: [
      { classBn: "মাল্টি-এক্সেল স্ক্যানিয়া এসি (ঢাকা-চট্টগ্রাম)", classEn: "Multi-axle Scania AC (Dhaka-Ctg)", fareBn: "৳ ১,২০০", fareEn: "৳ 1,200" },
      { classBn: "মাল্টি-এক্সেল স্ক্যানিয়া এসি (ঢাকা-কক্সবাজার)", classEn: "Multi-axle Scania AC (Dhaka-Cox's)", fareBn: "৳ ১,৮০০", fareEn: "৳ 1,800" },
      { classBn: "লাক্সারি স্লিপার ক্লাস (ফুল বেড)", classEn: "Luxury Sleeper Class (Full Bed)", fareBn: "৳ ২,৫০০", fareEn: "৳ 2,500" },
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
    officialLinks: [
      { labelBn: "সহজ ডটকম বাস টিকিট বুকিং", labelEn: "Shohoz.com Online Bus Booking", url: "https://www.shohoz.com/bus-tickets", primary: true, badgeBn: "অনলাইন সিট", badgeEn: "Seat Booking" },
      { labelBn: "বাসবিডি অনলাইন টিকিট", labelEn: "BusBD Portal", url: "https://busbd.com.bd" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7320,90.4190&destination=21.4339,91.9750&travelmode=driving",
  },
  {
    id: "launch-sundarban-manami",
    type: "launch",
    typeLabelBn: "নৌপথ ও বিলাসবহুল লঞ্চ",
    typeLabelEn: "Waterways & Luxury Launch",
    titleBn: "এমভি সুন্দরবন-১০ / এমভি মানামী",
    titleEn: "MV Sundarban-10 / MV Manami",
    code: "BIWTA-L-10",
    operatorBn: "বিআইডব্লিউটিএ অনুমোদিত ওয়াটারওয়েজ নেটওয়ার্ক",
    operatorEn: "BIWTA Approved Inland Water Transport",
    routeSummaryBn: "ঢাকা সদরঘাট লঞ্চ টার্মিনাল ↔ চাঁদপুর ↔ বরিশাল লঞ্চ ঘাট",
    routeSummaryEn: "Dhaka Sadarghat Launch Terminal ↔ Chandpur ↔ Barishal Ghat",
    distanceKm: 170,
    durationBn: "৭ ঘণ্টা ৩০ মিনিট - ৮ ঘণ্টা",
    durationEn: "7 hrs 30 mins - 8 hrs",
    frequencyBn: "প্রতিদিন রাত ৮:৩০ মিনিটে সদরঘাট থেকে যাত্রা",
    frequencyEn: "Departs daily at 8:30 PM from Sadarghat",
    operatingHoursBn: "রাত ৮:০০ - ভোর ৫:০০",
    operatingHoursEn: "8:00 PM - 5:00 AM",
    statusBn: "মেঘনা ও কীর্তনখোলা নদী পথে নিয়মিত সার্ভিস",
    statusEn: "Regular river sailing active",
    fareBreakdown: [
      { classBn: "সাধারণ ডেক (ওপেন স্পেস)", classEn: "General Deck (Open)", fareBn: "৳ ৩৫০", fareEn: "৳ 350" },
      { classBn: "সিঙ্গেল কেবিন (এসি)", classEn: "Single AC Cabin", fareBn: "৳ ১,৪০০", fareEn: "৳ 1,400" },
      { classBn: "ডাবল কেবিন (এসি)", classEn: "Double AC Cabin", fareBn: "৳ ২,৬০০", fareEn: "৳ 2,600" },
      { classBn: "ভিআইপি ফ্যামিলি স্যুট", classEn: "VIP Family Suite", fareBn: "৳ ৬,৫০০", fareEn: "৳ 6,500", noteBn: "ফ্রিজ, টিভি ও এটাচড বারান্দা", noteEn: "Fridge, TV & Attached Balcony" },
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
    officialLinks: [
      { labelBn: "বিআইডব্লিউটিএ অফিশিয়াল বাতায়ন", labelEn: "BIWTA Official Portal", url: "https://biwta.gov.bd", primary: true, badgeBn: "নৌ পরিবহন", badgeEn: "Waterways" },
    ],
    googleMapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&origin=23.7042,90.4132&destination=22.7010,90.3535",
  },
];
