const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TournamentPlayersSchema = new Schema({
    user_id: Schema.Types.ObjectId,
    tournament_id: Schema.Types.ObjectId,
    is_visible: {
        type: Boolean,
        default: true
    }
}, {collection: 'TournamentPlayers'})

module.exports = mongoose.model('TournamentPlayers', TournamentPlayersSchema);