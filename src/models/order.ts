import { Schema, Document, model, Types } from 'mongoose';

import { ProductDocument } from './product.js';

// Define structure of a order document
export interface OrderDocument extends Document {
  products: [
    {
      product: ProductDocument;
      quantity: number;
    },
  ];
  user: {
    name: string;
    id: Types.ObjectId;
  };
}

// Define the schema for the product collection
const ordersSchema = new Schema<OrderDocument>({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
});

const OrderModel = model<OrderDocument>('Order', ordersSchema);

export default OrderModel;
