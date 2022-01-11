
import mongoose from 'mongoose';

const linksSchema = mongoose.Schema({
    title: { type: String, required: true },
    path: {type: String, required: true},
    gdriveId: {type: String, required: false},
    gdriveFolderId: {type: String, required: false},
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    description: { type: String, required: false },
});
linksSchema.set('toJSON', {
    // virtuals: true, // convert _id to id
    versionKey: false,
    // transform: function (doc, ret) {
    //     // remove these props when object is serialized
    //     delete ret._id;
    // }
});

export default mongoose.model('Links', linksSchema)