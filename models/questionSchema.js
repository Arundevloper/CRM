
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    label: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label',
        required: true
    },
    question_text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
