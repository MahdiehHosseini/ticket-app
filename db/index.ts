import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// در حالت dev از ساخته‌شدن اتصال‌های تکراری با hot reload جلوگیری می‌کنیم
const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres> }
export const sql = g.__sql ?? postgres(process.env.DATABASE_URL!, { prepare: false })
if (process.env.NODE_ENV !== 'production') g.__sql = sql

export const db = drizzle(sql, { schema })
