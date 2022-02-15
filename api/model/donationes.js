
import mongoose from 'mongoose';

const donationesSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    time: { type: mongoose.Schema.Types.Date, required: true, default: Date.now()},
    Amount: { type: mongoose.Schema.Types.Number, required: true},
    Currency: { type: mongoose.Schema.Types.String, required: true},
    Tashloumim: { type: mongoose.Schema.Types.String},
    LastNum: { type: mongoose.Schema.Types.String, required: true},
    Confirmation: { type: mongoose.Schema.Types.String, required: true},
    Comments: { type: mongoose.Schema.Types.String},
    incomingJson: { type: mongoose.Schema.Types.Mixed}
});

donationesSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.incomingJson;
    }
});

donationesSchema.method('toClient', function() {
    var obj = this.toObject();
    //Rename fields
    obj.id = obj._id;
    delete obj._id;
    delete obj.incomingJson
    delete obj.__v

    let objectOrder = {
        'id': null,
    }

    obj = Object.assign(objectOrder, obj);

    return obj;
});

export default mongoose.model('Donationes', donationesSchema);