import { Schema, Document, model, Types } from 'mongoose';

// Define the structure of a product document
export interface ProductDocument extends Document {
  title: string;
  price: number;
  description: string;
  image: Buffer;
  userId: Types.ObjectId;
}

// Define the schema for the product collection
const productSchema = new Schema<ProductDocument>({
  // Title of the product
  title: { type: String, required: true },

  // Price of the product
  price: { type: Number, required: true },

  // Description of the product
  description: { type: String, required: true },

  // Binary image data of the product
  // TODO: use multer deal with image buffer and then set required to true
  image: { type: Buffer },

  // Id of user who created this product
  // userId references ("ref") to the User model
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Create a model based on the product schema
const ProductModel = model<ProductDocument>('Product', productSchema);

export default ProductModel;
