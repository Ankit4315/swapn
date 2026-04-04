import mongoose from 'mongoose';

const DreamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dream must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a dream title'],
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Please provide dream content'],
    },
    mood: {
      type: String,
      enum: ['peaceful', 'happy', 'scary', 'confusing', 'vivid', 'lucid', 'nightmare', 'unknown'],
      default: 'unknown',
    },
    tags: [
      {
        type: String,
        maxlength: 30,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
DreamSchema.index({ title: 'text', content: 'text' });
DreamSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Dream || mongoose.model('Dream', DreamSchema);
