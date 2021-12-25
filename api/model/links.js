
import mongoose from 'mongoose';

const linksSchema = mongoose.Schema({
    title: { type: String, required: true },
    path: {type: String, required: true},
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    description: { type: String, required: false },
});

export default mongoose.model('Links', linksSchema)