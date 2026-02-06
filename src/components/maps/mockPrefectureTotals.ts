// Mock data: Total number of foreign residents per prefecture
// Based on 2024 Immigration Services Agency data (approximated)

export interface PrefectureTotalData {
    name: string;
    total: number;
}

export const PREFECTURE_TOTALS: Record<string, PrefectureTotalData> = {
    "Hokkai Do": { name: "Hokkaido", total: 45200 },
    "Aomori Ken": { name: "Aomori", total: 8500 },
    "Iwate Ken": { name: "Iwate", total: 9800 },
    "Miyagi Ken": { name: "Miyagi", total: 28400 },
    "Akita Ken": { name: "Akita", total: 6200 },
    "Yamagata Ken": { name: "Yamagata", total: 8900 },
    "Fukushima Ken": { name: "Fukushima", total: 18500 },
    "Ibaraki Ken": { name: "Ibaraki", total: 78600 },
    "Tochigi Ken": { name: "Tochigi", total: 52400 },
    "Gunma Ken": { name: "Gunma", total: 64800 },
    "Saitama Ken": { name: "Saitama", total: 198000 },
    "Chiba Ken": { name: "Chiba", total: 172000 },
    "Tokyo To": { name: "Tokyo", total: 580000 },
    "Kanagawa Ken": { name: "Kanagawa", total: 268000 },
    "Niigata Ken": { name: "Niigata", total: 16200 },
    "Toyama Ken": { name: "Toyama", total: 19800 },
    "Ishikawa Ken": { name: "Ishikawa", total: 22400 },
    "Fukui Ken": { name: "Fukui", total: 14800 },
    "Yamanashi Ken": { name: "Yamanashi", total: 17200 },
    "Nagano Ken": { name: "Nagano", total: 45000 },
    "Gifu Ken": { name: "Gifu", total: 58600 },
    "Shizuoka Ken": { name: "Shizuoka", total: 98400 },
    "Aichi Ken": { name: "Aichi", total: 288000 },
    "Mie Ken": { name: "Mie", total: 58200 },
    "Shiga Ken": { name: "Shiga", total: 38400 },
    "Kyoto Fu": { name: "Kyoto", total: 68500 },
    "Osaka Fu": { name: "Osaka", total: 262000 },
    "Hyogo Ken": { name: "Hyogo", total: 118000 },
    "Nara Ken": { name: "Nara", total: 18600 },
    "Wakayama Ken": { name: "Wakayama", total: 9400 },
    "Tottori Ken": { name: "Tottori", total: 5800 },
    "Shimane Ken": { name: "Shimane", total: 9200 },
    "Okayama Ken": { name: "Okayama", total: 38600 },
    "Hiroshima Ken": { name: "Hiroshima", total: 68400 },
    "Yamaguchi Ken": { name: "Yamaguchi", total: 18800 },
    "Tokushima Ken": { name: "Tokushima", total: 8600 },
    "Kagawa Ken": { name: "Kagawa", total: 18200 },
    "Ehime Ken": { name: "Ehime", total: 16800 },
    "Kochi Ken": { name: "Kochi", total: 6400 },
    "Fukuoka Ken": { name: "Fukuoka", total: 88600 },
    "Saga Ken": { name: "Saga", total: 12400 },
    "Nagasaki Ken": { name: "Nagasaki", total: 14200 },
    "Kumamoto Ken": { name: "Kumamoto", total: 22800 },
    "Oita Ken": { name: "Oita", total: 15600 },
    "Miyazaki Ken": { name: "Miyazaki", total: 9800 },
    "Kagoshima Ken": { name: "Kagoshima", total: 12200 },
    "Okinawa Ken": { name: "Okinawa", total: 28400 }
};

// Helper to get total for a prefecture
export const getPrefectureTotal = (prefectureName: string): number => {
    return PREFECTURE_TOTALS[prefectureName]?.total || 0;
};

// Get min and max values for color scale
export const getTotalRange = (): [number, number] => {
    const totals = Object.values(PREFECTURE_TOTALS).map(p => p.total);
    return [Math.min(...totals), Math.max(...totals)];
};
