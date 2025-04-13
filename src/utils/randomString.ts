import range from 'lodash-es/range'

export default function randomString (
  length: number = 10,
  chars: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
): string {
  return range(length).
  map(() => chars[Math.floor(Math.random() * chars.length)]).
  join('')
}