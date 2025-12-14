import { db } from '../lib/db'
import { products } from '../db/schema/product'
import { count } from 'drizzle-orm'
import { json } from '../lib/helpers'

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    try {
      // Fetch all products
      const queryResult = await db.select().from(products)
      console.log(queryResult)

      // Fetch total count
      const countResult = await db.select({ count: count() }).from(products)
      console.log(countResult)

      // Return data
      return json(200, { total: countResult[0].count, items: queryResult })

    } catch(err) {
      console.error(err)
      return json(500, { message: 'server error', error: String(err) })
    }
  }

  return json(405, { message: 'Method not allowed' })
}
