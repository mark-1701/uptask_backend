import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IToken extends Document {
  token: string;
  user: Types.ObjectId;
  createdAt: Date;
}

const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true
  },
  user: {
    type: Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    default: Date.now(),
    // después de 10 minutos se elimina el token
    expires: '10m'
  }
});

const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
