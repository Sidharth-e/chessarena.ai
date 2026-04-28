import mongoose, { Schema, Document } from 'mongoose';

export interface IUserConfig extends Document {
  white: { provider: string; model: string };
  black: { provider: string; model: string };
}

const UserConfigSchema: Schema = new Schema({
  white: {
    provider: { type: String, default: 'Human' },
    model: { type: String, default: '' }
  },
  black: {
    provider: { type: String, default: 'OpenAI' },
    model: { type: String, default: 'gpt-4o' }
  }
}, { timestamps: true });

export default mongoose.models.UserConfig || mongoose.model<IUserConfig>('UserConfig', UserConfigSchema);
