var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


/* routes */
//get list of all games
router.get('/game/list', function(req, res) {
    res.send(gameList);
});

//get a game to start
router.get('/game/start', function(req, res) {
    if(req.query.playerNumber === "1")
    {
        if (gameList[req.query.gameNumber].player1taken === true)
        {
            res.send('{"success" : "Player already taken", "status" : 404}');
            return;
        }
        else
        {
            gameList[req.query.gameNumber].player1taken = true;
            gameList[req.query.gameNumber].log.push("Player 1 has joined the game");
        }
    }
    else if(req.query.playerNumber === "2")
    {
        if (gameList[req.query.gameNumber].started === true)
        {
            res.send('{"success" : "Player already taken", "status" : 404}');
            return;
        }
        else
        {
            gameList[req.query.gameNumber].started = true;
            gameList[req.query.gameNumber].log.push("Player 2 has joined the game");
        }
    }
    res.send(gameList[req.query.gameNumber]);
});

//get a specific game information
router.get('/game/see', function(req, res) {
    res.send(gameList[req.query.gameNumber]);
});

//manulally reset all games
router.post('/game/reset', function(req, res) {
    for (let i = 0; i < gameList.length; ++i)
    {
        gameList[i] = JSON.parse(JSON.stringify(defaultGame));
        gameList[i].number = i;
    }
    res.end('{"success" : "Updated Successfully", "status" : 200}');
});

//allows a player to perform a move
router.post('/game/move', function(req, res) {
    let game = req.body.game;
    //if game is over return and do not allow any further moves
    if (gameList[game].gameOver)
    {
        res.end('{"success" : "Game already over", "status" : 200}');
        return;
    }
    let move = req.body.move;
    let player = req.body.player;
    let opponent;
    if (player === 1)
    {
        opponent = 1;
    }
    else
    {
        opponent = 0;
    }
    player--;
    //perform damage of attack
    gameList[game].players[opponent].hp -= gameList[game].players[player].attacks[move].damage;
    //update log
    gameList[game].log.push("Player " + (player + 1) + " hit Player " + (opponent + 1) + " with a " + 
                            gameList[game].players[player].attacks[move].title + " for " + 
                            gameList[game].players[player].attacks[move].damage + " damage.");
    gameList[game].log.push("Player " + (opponent + 1) + " at " + gameList[game].players[opponent].hp + " hp.");
    gameList[game].player1turn = !gameList[game].player1turn;
    
    //check if game is over
    checkGameOver(game);
    
    //send response
    res.end('{"success" : "Updated Successfully", "status" : 200}');
});


module.exports = router;

/* constant values */
const NUM_GAMES = 5;
/* set up game list */


var gameList = [];

const defaultGame = {
        number: "0",
        started: false,
        gameOver: false,
        winner: 0,
        player1taken: false,
        player1turn: true,
        log: [],
        players: [{
                name: "player1",
                hp: 20,
                attacks: [{
                        title: "basic",
                        damage: 5,
                    },
                    {
                        title: "special",
                        damage: 10,
                    }
                ]
            },
            {
                name: "player2",
                hp: 20,
                attacks: [{
                        title: "basic",
                        damage: 5,
                    },
                    {
                        title: "special",
                        damage: 10,
                    }
                ]
            }
        ],
    };
    
const gameListInit = function() {
    for (let i = 0; i < NUM_GAMES; ++i)
    {
        gameList.push(JSON.parse(JSON.stringify(defaultGame)));
        gameList[i].number = i;
    }
};

gameListInit();

/* helperFunctions */
//checks if game is over and updates game
const checkGameOver = (game) => {
    if ((gameList[game].players[0].hp <= 0) &&
        (gameList[game].players[1].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 0;
        }
    else if ((gameList[game].players[0].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 2;
        }
    else if ((gameList[game].players[1].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 1;
        }
};