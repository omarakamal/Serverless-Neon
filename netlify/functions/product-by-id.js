import { db } from '../lib/db.js';
import { products } from '../db/schema/product.js';
import { eq } from 'drizzle-orm';
import { json, UpdateProduct, getId } from '../lib/helpers.js';

export async function handler(event) {
  try {
    const id = Number(getId(event));
    if (!id || Number.isNaN(id)) {
      return json(400, { message: 'invalid product id' });
    }

    // ─────────────────────────────
    // GET /products/:id
    // ─────────────────────────────
    if (event.httpMethod === 'GET') {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (result.length === 0) {
        return json(404, { message: 'product not found' });
      }

      return json(200, result[0]);
    }

    // ─────────────────────────────
    // PUT / PATCH /products/:id
    // ─────────────────────────────
    if (event.httpMethod === 'PUT' || event.httpMethod === 'PATCH') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return json(400, { message: 'invalid JSON body' });
      }

      const parsed = UpdateProduct.safeParse(body);
      if (!parsed.success) {
        return json(400, {
          message: 'invalid body',
          issues: parsed.error.format(),
        });
      }

      const updated = await db
        .update(products)
        .set(parsed.data)
        .where(eq(products.id, id))
        .returning();

      if (updated.length === 0) {
        return json(404, { message: 'product not found' });
      }

      return json(200, updated[0]);
    }

    // ─────────────────────────────
    // DELETE /products/:id
    // ─────────────────────────────
    if (event.httpMethod === 'DELETE') {
      const deleted = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ id: products.id });

      if (deleted.length === 0) {
        return json(404, { message: 'product not found' });
      }

      return {
        statusCode: 204,
        headers: { 'Content-Type': 'application/json' },
        body: '',
      };
    }

    return json(405, { message: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return json(500, { message: 'server error', error: String(err) });
  }
}
