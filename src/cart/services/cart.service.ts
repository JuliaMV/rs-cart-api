import { Injectable, Inject } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';
import { PG_CONNECTION } from '../../constants';

const mockUserId = 'a7ab9250-3c96-4d09-8e79-424912e280f0';
const mockItemsPayload: CartItem[] = [
  {
    product: { id: v4(v4()), title: '', price: 3, description: '' },
    count: 1,
  },
  {
    product: { id: v4(v4()), title: '', price: 4, description: '' },
    count: 2,
  },
];

@Injectable()
export class CartService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async findByUserId(userId: string = mockUserId): Promise<Cart> {
    const dbCarts = await this.conn.query(
      `SELECT * from carts WHERE user_id='${userId}'`,
    );

    // hack for using one user-id
    const cart = dbCarts.rows[0];

    if (!cart) {
      return null;
    }

    const dbItems = await this.conn.query(
      `SELECT * from cart_items WHERE cart_id='${cart.id}'`,
    );
    const cartItems = dbItems.rows.map(item => ({
      product: { id: item.product_id, price: 5.2 },
      count: item.count,
    }));

    return { id: cart.id, items: cartItems };
  }

  async createByUserId(userId: string = mockUserId): Promise<Cart> {
    const id = v4(v4());
    await this.conn.query(`
      insert into carts (id, user_id, created_at, updated_at, status) values
      ('${id}', '${userId}', '${new Date().toISOString()}', '${new Date().toISOString()}', 'OPEN')
    `);

    return { id, items: [] };
  }

  async findOrCreateByUserId(userId: string = mockUserId): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string = mockUserId,
    { items = mockItemsPayload }: Cart,
  ): Promise<Cart> {
    const { id: cartId } = await this.findOrCreateByUserId(userId);

    await this.conn.query(`
      DELETE from cart_items WHERE cart_id='${cartId}'
    `);

    items.forEach(async item => {
      await this.conn.query(`
      INSERT into cart_items (cart_id, product_id, count) values
      ('${cartId}', '${item.product.id}', '${item.count}')
    `);
    });

    return { id: cartId, items };
  }

  async removeByUserId(userId = mockUserId): Promise<void> {
    const cartsDb = await this.conn.query(`
      SELECT (id) from carts WHERE user_id='${userId}'
    `);
    const cart = cartsDb.rows[0];

    await this.conn.query(`
      DELETE from cart_items WHERE cart_id='${cart.id}'
    `);

    await this.conn.query(`
      DELETE from carts WHERE id='${cart.id}'
    `);
  }
}
