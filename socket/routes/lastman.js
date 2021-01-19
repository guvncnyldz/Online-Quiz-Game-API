var game_server = require('../class/game-server')

module.exports = (data, ws) => {
    switch (data.method) {
        case 'joinlastmanroom':
            console.log(data)
            joinLastRoom(data, ws)
            break;
        case 'answer':
            answer(data, ws)
            break;
        case 'fall':
            fall(ws)
            break;
    }
}

function joinLastRoom(data, ws) {
    ws.pid = data.pid;

    ws.on('close', function () {
        fall(ws)
    })

    let room = game_server.SetServer(ws);
    ws.room = room;

    let pids = []

    room.players.forEach((player) => {
        pids.push(player.pid)
    })

    let response = {
        "route": "lastman",
        "method": "connected",
        "player_count": room.player_count,
        "total_count": room.total_count,
        pids
    }

    ws.send(JSON.stringify(response))

    room.players.forEach((player) => {
        if (ws != player) {

            let response = {
                "route": "lastman",
                "method": "addplayer",
                "player_count": room.player_count,
                "pid": ws.pid
            }
            console.log("Send: ", response)

            player.send(JSON.stringify(response))
        }


        if (room.is_start) {
            let response = {
                "route": "lastman",
                "method": "start",
            }
            console.log("Send: ", response)

            player.send(JSON.stringify(response))
        }
    })

    if (room.is_start) {
        setTimeout(() => {
            if (ws.room == null)
                return

            ws.room.GetQuestion(() => {
                ws.in_answer = false;
                let response = {
                    "route": "lastman",
                    "method": "setquestion",
                    "_id": room.current_question._id,
                    "question": room.current_question.question,
                    "answerA": room.current_question.answerA,
                    "answerB": room.current_question.answerB,
                    "answerC": room.current_question.answerC,
                    "answerD": room.current_question.answerD,
                    "correct_answer": room.current_question.correct_answer,
                }

                ws.room.players.forEach((player) => {
                    player.is_answer = false;
                    console.log("Send: ", response)

                    player.send(JSON.stringify(response))
                })
            })
        }, 1000)
    }
}

function answer(data, ws) {
    ws.is_answer = true;

    let answer_count = 0;

    let fixed_answer = data.answer;

    if (fixed_answer == -1)
        fixed_answer = ws.room.current_question.correct_answer

    ws.current_answer = fixed_answer;

    ws.room.players.forEach((player) => {
        let response = {
            "route": "lastman",
            "method": "answer",
            "answer": fixed_answer,
            "pid": ws.pid
        }

        if (player.is_answer)
            answer_count++;

        console.log("Send: ", response)
        player.send(JSON.stringify(response))
    })

    if (answer_count >= ws.room.player_count) {
        SendAnswer(ws)
    }
}

function SendAnswer(ws) {
    setTimeout(() => {
            ws.is_answer = false;

            let results = []
            if (ws.room == null)
                return

            ws.room.players.forEach((player) => {
                if(ws.room == null)
                    return
                result = {
                    pid: player.pid,
                    result: player.room.current_question.correct_answer == player.current_answer ? 1 : 0
                }

                results.push(result)
            })

            let response = {
                "route": "lastman",
                "method": "result",
                results,
                player_count: ws.room.player_count,
                correct_answer: ws.room.current_question.correct_answer
            }

            ws.room.players.forEach((player) => {
                console.log("Send: ", response)

                player.send(JSON.stringify(response))
            })

            setTimeout(() => {
                if (ws.room == null)
                    return

                ws.room.GetQuestion(() => {
                    let response = {
                        "route": "lastman",
                        "method": "setquestion",
                        "_id": ws.room.current_question._id,
                        "question": ws.room.current_question.question,
                        "answerA": ws.room.current_question.answerA,
                        "answerB": ws.room.current_question.answerB,
                        "answerC": ws.room.current_question.answerC,
                        "answerD": ws.room.current_question.answerD,
                        "correct_answer": ws.room.current_question.correct_answer,

                    }

                    ws.room.players.forEach((player) => {
                        player.is_answer = false;
                        console.log("Send: ", response)


                        player.send(JSON.stringify(response))
                    })
                })
            }, 2000)
        },
        2000)
}

function fall(ws) {
    ws.room.RemovePlayer(ws);
    let answer_count = 0;
    ws.room.players.forEach((player) => {
        let response = {
            "route": "lastman",
            "method": "fall",
            "pid": ws.pid
        }

        console.log("Send: ", response)

        if (player.is_answer)
            answer_count++;

        player.send(JSON.stringify(response))
    })

    if (!ws.room.is_start) {
        ws.room.players.forEach((player) => {

            let response = {
                "route": "lastman",
                "method": "removeplayer",
                "player_count": ws.room.player_count,
                "pid": ws.pid
            }
            console.log("Send: ", response)

            player.send(JSON.stringify(response))
        })
    } else {
        if (ws.room.player_count == 0) {
            delete ws.room;
        } else if (answer_count >= ws.room.player_count) {
            ws.room.players.forEach((player) => SendAnswer(player))
        }
    }

}