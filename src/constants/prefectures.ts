
export interface PrefectureDef {
    code: string;
    en: string;
    pt: string;
    ja: string;
}

export const PREFECTURES: PrefectureDef[] = [
    { code: '01', en: 'Hokkaido', pt: 'Hokkaido', ja: '北海道' },
    { code: '02', en: 'Aomori', pt: 'Aomori', ja: '青森県' },
    { code: '03', en: 'Iwate', pt: 'Iwate', ja: '岩手県' },
    { code: '04', en: 'Miyagi', pt: 'Miyagi', ja: '宮城県' },
    { code: '05', en: 'Akita', pt: 'Akita', ja: '秋田県' },
    { code: '06', en: 'Yamagata', pt: 'Yamagata', ja: '山形県' },
    { code: '07', en: 'Fukushima', pt: 'Fukushima', ja: '福島県' },
    { code: '08', en: 'Ibaraki', pt: 'Ibaraki', ja: '茨城県' },
    { code: '09', en: 'Tochigi', pt: 'Tochigi', ja: '栃木県' },
    { code: '10', en: 'Gunma', pt: 'Gunma', ja: '群馬県' },
    { code: '11', en: 'Saitama', pt: 'Saitama', ja: '埼玉県' },
    { code: '12', en: 'Chiba', pt: 'Chiba', ja: '千葉県' },
    { code: '13', en: 'Tokyo', pt: 'Tóquio', ja: '東京都' },
    { code: '14', en: 'Kanagawa', pt: 'Kanagawa', ja: '神奈川県' },
    { code: '15', en: 'Niigata', pt: 'Niigata', ja: '新潟県' },
    { code: '16', en: 'Toyama', pt: 'Toyama', ja: '富山県' },
    { code: '17', en: 'Ishikawa', pt: 'Ishikawa', ja: '石川県' },
    { code: '18', en: 'Fukui', pt: 'Fukui', ja: '福井県' },
    { code: '19', en: 'Yamanashi', pt: 'Yamanashi', ja: '山梨県' },
    { code: '20', en: 'Nagano', pt: 'Nagano', ja: '長野県' },
    { code: '21', en: 'Gifu', pt: 'Gifu', ja: '岐阜県' },
    { code: '22', en: 'Shizuoka', pt: 'Shizuoka', ja: '静岡県' },
    { code: '23', en: 'Aichi', pt: 'Aichi', ja: '愛知県' },
    { code: '24', en: 'Mie', pt: 'Mie', ja: '三重県' },
    { code: '25', en: 'Shiga', pt: 'Shiga', ja: '滋賀県' },
    { code: '26', en: 'Kyoto', pt: 'Kyoto', ja: '京都府' },
    { code: '27', en: 'Osaka', pt: 'Osaka', ja: '大阪府' },
    { code: '28', en: 'Hyogo', pt: 'Hyogo', ja: '兵庫県' },
    { code: '29', en: 'Nara', pt: 'Nara', ja: '奈良県' },
    { code: '30', en: 'Wakayama', pt: 'Wakayama', ja: '和歌山県' },
    { code: '31', en: 'Tottori', pt: 'Tottori', ja: '鳥取県' },
    { code: '32', en: 'Shimane', pt: 'Shimane', ja: '島根県' },
    { code: '33', en: 'Okayama', pt: 'Okayama', ja: '岡山県' },
    { code: '34', en: 'Hiroshima', pt: 'Hiroshima', ja: '広島県' },
    { code: '35', en: 'Yamaguchi', pt: 'Yamaguchi', ja: '山口県' },
    { code: '36', en: 'Tokushima', pt: 'Tokushima', ja: '徳島県' },
    { code: '37', en: 'Kagawa', pt: 'Kagawa', ja: '香川県' },
    { code: '38', en: 'Ehime', pt: 'Ehime', ja: '愛媛県' },
    { code: '39', en: 'Kochi', pt: 'Kochi', ja: '高知県' },
    { code: '40', en: 'Fukuoka', pt: 'Fukuoka', ja: '福岡県' },
    { code: '41', en: 'Saga', pt: 'Saga', ja: '佐賀県' },
    { code: '42', en: 'Nagasaki', pt: 'Nagasaki', ja: '長崎県' },
    { code: '43', en: 'Kumamoto', pt: 'Kumamoto', ja: '熊本県' },
    { code: '44', en: 'Oita', pt: 'Oita', ja: '大分県' },
    { code: '45', en: 'Miyazaki', pt: 'Miyazaki', ja: '宮崎県' },
    { code: '46', en: 'Kagoshima', pt: 'Kagoshima', ja: '鹿児島県' },
    { code: '47', en: 'Okinawa', pt: 'Okinawa', ja: '沖縄県' }
];

export const getPrefectureLabel = (code: string, lang: 'en' | 'pt' | 'ja' = 'en'): string => {
    const pref = PREFECTURES.find(p => p.code === code);
    if (!pref) return code;
    return pref[lang] || pref.en;
};
