export interface CurrencyOption {
  label: string
  value: string
  symbol: string
  locale?: string
}

const currencies: CurrencyOption[] = [
  { label: 'U.S. Dollar', value: 'USD', symbol: '$', locale: 'en-US' },
  { label: 'Euro', value: 'EUR', symbol: '€', locale: 'de-DE' },
  { label: 'Pound Sterling', value: 'GBP', symbol: '£', locale: 'en-GB' },
  { label: 'Canadian Dollar', value: 'CAD', symbol: 'C$', locale: 'en-CA' },
  { label: 'Australian Dollar', value: 'AUD', symbol: 'A$', locale: 'en-AU' },
  { label: 'Japanese Yen', value: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { label: 'Indian Rupee', value: 'INR', symbol: '₹', locale: 'en-IN' },
  { label: 'Bangladeshi Taka', value: 'BDT', symbol: '৳', locale: 'bn-BD' },
  { label: 'Pakistani Rupee', value: 'PKR', symbol: '₨', locale: 'ur-PK' },
  { label: 'Brazilian Real', value: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  { label: 'Chinese Yuan', value: 'CNY', symbol: '¥', locale: 'zh-CN' },
  { label: 'Czech Koruna', value: 'CZK', symbol: 'Kč', locale: 'cs-CZ' },
  { label: 'Danish Krone', value: 'DKK', symbol: 'kr', locale: 'da-DK' },
  { label: 'Hong Kong Dollar', value: 'HKD', symbol: 'HK$', locale: 'zh-HK' },
  { label: 'Hungarian Forint', value: 'HUF', symbol: 'Ft', locale: 'hu-HU' },
  { label: 'Israeli Shekel', value: 'ILS', symbol: '₪', locale: 'he-IL' },
  { label: 'Malaysian Ringgit', value: 'MYR', symbol: 'RM', locale: 'ms-MY' },
  { label: 'Mexican Peso', value: 'MXN', symbol: '$', locale: 'es-MX' },
  { label: 'Norwegian Krone', value: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  { label: 'New Zealand Dollar', value: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
  { label: 'Philippine Peso', value: 'PHP', symbol: '₱', locale: 'en-PH' },
  { label: 'Polish Zloty', value: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  { label: 'Russian Ruble', value: 'RUB', symbol: '₽', locale: 'ru-RU' },
  { label: 'Singapore Dollar', value: 'SGD', symbol: 'S$', locale: 'en-SG' },
  { label: 'Swedish Krona', value: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  { label: 'Swiss Franc', value: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  { label: 'Taiwan New Dollar', value: 'TWD', symbol: 'NT$', locale: 'zh-TW' },
  { label: 'Thai Baht', value: 'THB', symbol: '฿', locale: 'th-TH' },
  { label: 'Nigerian Naira', value: 'NGN', symbol: '₦', locale: 'en-NG' },
  { label: 'South African Rand', value: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  { label: 'Ghanaian Cedi', value: 'GHS', symbol: 'GH₵', locale: 'en-GH' },
  { label: 'Kenyan Shilling', value: 'KES', symbol: 'KSh', locale: 'en-KE' },
  { label: 'Indonesian Rupiah', value: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  { label: 'Turkish Lira', value: 'TRY', symbol: '₺', locale: 'tr-TR' },
  { label: 'United Arab Emirates Dirham', value: 'AED', symbol: 'AED', locale: 'ar-AE' },
  { label: 'Saudi Riyal', value: 'SAR', symbol: 'SAR', locale: 'ar-SA' },
]

export default currencies
