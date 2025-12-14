import { db } from "../lib/db.js";
import { products } from "../db/schema/product.js";
import { ilike, desc  } from "drizzle-orm";
// import { requireAdmin } from '../lib/auth.js';
import { json, CreateProduct, intOr } from "../lib/helpers.js";
import { count } from 'drizzle-orm'


export async function handler(event) {
  try {
    // LIST PRODUCTS
if (event.httpMethod === 'GET') {
  const qs = event.queryStringParameters || {};
  const page = Math.max(1, intOr(qs.page, 1));
  const pageSize = Math.min(100, Math.max(1, intOr(qs.pageSize ?? qs.limit, 12)));
  const q = (qs.q || qs.name || '').trim();

  let query = db.select().from(products);
  let countQuery = db.select({ count: count() }).from(products);

  if (products.createdAt) {
    query = query.orderBy(products.createdAt.desc);
  }

  if (q) {
    query = query.where(ilike(products.name, `%${q}%`));
    countQuery = countQuery.where(ilike(products.name, `%${q}%`));
  }

  const totalResult = await countQuery;
  const items = await query.limit(pageSize).offset((page - 1) * pageSize);

  return json(200, { page, pageSize, total: totalResult[0].count, items });
}



    // CREATE PRODUCT
    if (event.httpMethod === "POST") {
      // const gate = requireAdmin(event);
      // if (!gate.ok) return json(gate.status, gate.body);

      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch {
        return json(400, { message: "invalid JSON body" });
      }

      const parsed = CreateProduct.safeParse(body);
      if (!parsed.success) {
        return json(400, {
          message: "invalid body",
          issues: parsed.error.format(),
        });
      }

      const [doc] = await db.insert(products).values(parsed.data).returning();
      return json(201, doc);
    }

    return json(405, { message: "Method not allowed" });
  } catch (e) {
    console.log(e)
    return json(500, { message: "server error", error: String(e) });
  }
}
