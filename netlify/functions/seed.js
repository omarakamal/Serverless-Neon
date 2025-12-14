import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { users } from '../db/schema/user';
import { eq } from 'drizzle-orm';
import { json } from '../lib/helpers';

function allowed(event) {
  const qs = event.queryStringParameters || {};
  return (
    process.env.SEED_SECRET &&
    (qs.secret || '') === process.env.SEED_SECRET
  );
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed' });
  }

  if (!allowed(event)) {
    return json(403, { message: 'forbidden' });
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return json(400, {
      message: 'missing ADMIN_EMAIL/ADMIN_PASSWORD',
    });
  }

  try {
    // Check if admin already exists
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existing.length > 0) {
      return json(200, {
        message: 'admin already exists',
        email: ADMIN_EMAIL,
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Insert admin user
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });

    return json(201, {
      message: 'admin created',
      email: ADMIN_EMAIL,
    });
  } catch (err) {
    console.error(err);
    return json(500, { message: 'seed failed', error: String(err) });
  }
}
