const Question = require('../../models/Questions')
const {logger} = require('../../utils');

const total_count = 4;
exports.servers = rooms = []

module.exports.SetServer = (player) => {
    if (rooms.is_start == 0) {
        let room = new LastManRoom();
        room.AddPlayer(player)
        rooms.push(room)
        console.log("İlk server: " + room.id)

        return room;
    } else {
        let isThereRoom = false;
        for (i = 0; i < rooms.length; i++) {
            if (!rooms[i].is_start) {
                rooms[i].AddPlayer(player)
                isThereRoom = true;
                return rooms[i];
            }
        }

        if (isThereRoom == false) {
            let room = new LastManRoom();
            room.AddPlayer(player)
            rooms.push(room)
            return room;
        }
    }
}

class LastManRoom {
    constructor() {
        this.is_start = false;
        this.player_count = 0;
        this.players = []
        this.total_count = total_count;
    }

    AddPlayer(player) {
        this.players.push(player)
        this.player_count++;

        if (this.player_count == total_count) {
            this.is_start = true;
        }
    }

    RemovePlayer(player) {
        this.players = removeItemOnce(this.players, player)
        this.player_count--;
    }

    GetQuestion(success)
    {
        Question.countDocuments((err, question_count) => {
            if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);

            let random = Math.floor(Math.random() * question_count)

            Question.findOne((err, question) => {
                if (err) logger.error(new Date().toISOString() + JSON.stringify(req.body) + err);
                else if (question) {
                    this.current_question = question;
                    success()
                }
            }).skip(random).select("-true_answer -false_answer");
        })
    }
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

module.exports = this;
