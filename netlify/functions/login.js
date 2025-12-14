import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { users } from '../db/schema/user';
import { eq } from 'drizzle-orm';
import { signAccessToken, setAuthCookieHeaders } from '../lib/auth.js';
import { json } from '../lib/helpers.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { message: 'Method not allowed' });
  }

  // Parse body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { message: 'invalid JSON body' });
  }

  const email = (body.email || '').toLowerCase().trim();
  const password = body.password || '';

  if (!email || !password) {
    return json(400, { message: 'email and password required' });
  }

  try {
    // Fetch user (only admins exist)
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return json(401, { message: 'invalid credentials' });
    }

    const user = result[0];

    // Verify password
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCorrect) {
      return json(401, { message: 'invalid credentials' });
    }

    // Sign JWT
    const token = signAccessToken({
      sub: String(user.id),
      role: 'admin',
      email: user.email,
    });

    const cookie = setAuthCookieHeaders(token);

    return json(
      200,
      {
        user: {
          id: user.id,
          email: user.email,
          role: 'admin',
        },
      },
      cookie
    );
  } catch (err) {
    console.error(err);
    return json(500, { message: 'login failed', error: String(err) });
  }
}
