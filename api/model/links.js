
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
    virtuals: true, // convert _id to id
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});

linksSchema.method('toClient', function() {
    var obj = this.toObject();
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v

    let objectOrder = {
        'id': null,
    }

    obj = Object.assign(objectOrder, obj);

    return obj;
});

export default mongoose.model('Links', linksSchema)