export function formatToCurrencyString(price: number):string{

      return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      }).format(price);
}

export function formatToCurrencyNumber(price: number):number {

      return  Number(price.toFixed(2))
}

const ruShortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

export function formatRuShortDate(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—';

  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return ruShortDateFormatter.format(date).replace(/\s*г\.?\s*$/, '');
}


export function toTitleCase(str:string) :string{
      str = str.replace('-',' ').replace(',',' ')
      return str.split(' ').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
  }