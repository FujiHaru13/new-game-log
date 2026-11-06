export type JsonObject = Record<string, unknown>;
export function object(value: unknown, label = 'object'): JsonObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  return value as JsonObject;
}
export function exactKeys(value: JsonObject, required: string[], optional: string[] = []) {
  if (required.some(key => !Object.hasOwn(value, key)) || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) throw new Error('Invalid contract fields');
}
export function uuid(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid UUID');
  return value.toLowerCase();
}
export function revision(value: unknown): string {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) > 9223372036854775807n) throw new Error('Invalid revision string');
  return value;
}
export function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid ISO date');
  const [y,m,d] = value.split('-').map(Number);
  const dt = new Date(0); dt.setUTCFullYear(y,m-1,d); dt.setUTCHours(0,0,0,0);
  if (!y || dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m-1 || dt.getUTCDate() !== d) throw new Error('Invalid calendar date');
  return value;
}
export function timestampMicros(value: unknown): bigint {
  if (typeof value !== 'string') throw new Error('Invalid DB timestamp');
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) throw new Error('Invalid DB timestamp');
  date(match[1]);
  const [hour,minute,second] = match.slice(2,5).map(Number);
  if (hour>23 || minute>59 || second>59) throw new Error('Invalid DB time');
  const dt = new Date(`${match[1]}T00:00:00Z`);
  let offset = 0;
  if (match[6] !== 'Z') {
    const hours = Number(match[6].slice(1,3)), minutes = Number(match[6].slice(4));
    if (hours>15 || minutes>59) throw new Error('Invalid timezone');
    offset = (hours*60+minutes)*(match[6][0] === '+' ? 1 : -1);
  }
  return BigInt(dt.getTime())*1000n + BigInt(hour*3600+minute*60+second-offset*60)*1000000n + BigInt((match[5] || '').padEnd(6,'0'));
}
export function dbTimestamp(value: unknown): string { timestampMicros(value); return value as string; }
export function freezeCopy<T>(value: T): Readonly<T> {
  const copy = structuredClone(value);
  function freeze(item: unknown) { if (item && typeof item === 'object') { Object.values(item).forEach(freeze); Object.freeze(item); } }
  freeze(copy); return copy;
}
export function same(a: unknown, b: unknown): boolean {
  if (Object.is(a,b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ak=Object.keys(a), bk=Object.keys(b);
  return ak.length===bk.length && ak.every(key => Object.hasOwn(b,key) && same((a as JsonObject)[key],(b as JsonObject)[key]));
}
