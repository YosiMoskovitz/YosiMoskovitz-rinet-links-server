
import mongoose from 'mongoose';

const statusesSchema = mongoose.Schema({
    title: { type: String, required: true },
});

statusesSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});

statusesSchema.method('toClient', function() {
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

export default mongoose.model('Statuses', statusesSchema)