// todo lazy init?
const localeList: Record<string, string[]> = {
  en: [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces'
  ],
  ru: [
    'Овен',
    'Телец',
    'Близнецы',
    'Рак',
    'Лев',
    'Дева',
    'Весы',
    'Скорпион',
    'Стрелец',
    'Козерог',
    'Водолей',
    'Рыбы'
  ],
  uk: [
    'Овен',
    'Телець',
    'Близнюки',
    'Рак',
    'Лев',
    'Діва',
    'Терези',
    'Скорпіон',
    'Стрілець',
    'Козеріг',
    'Водолій',
    'Риби'
  ]
};

export const getZodiacSign = (date: Date, locale = 'en') => {
  const sign =
    Number(
      new Intl.DateTimeFormat('fr-TN-u-ca-persian', {
        month: 'numeric'
      }).format(date)
    ) - 1;

  const list = localeList[locale] ?? localeList[0];

  return list[sign];
};
