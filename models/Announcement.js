const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const AnnouncementSchema = new Schema ({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    is_visible:{
        type: Boolean,
        default: true
    }
},{ collection: 'Announcement' })

module.exports=mongoose.model('Announcement',AnnouncementSchema);