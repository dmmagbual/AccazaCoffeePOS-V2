import type { Order } from '../types'
export interface OrderService { listRecent(): Promise<Order[]>; create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> }
export const orderService: OrderService = { async listRecent() { return [] }, async create(order) { return { ...order, id: crypto.randomUUID(), createdAt: new Date().toISOString() } } }
