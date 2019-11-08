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
router.post('/game/start', function(req, res) {
    if(req.body.playerNumber === 1)
    {
        if (gameList[req.body.gameNumber].player1taken === true)
        {
            console.log("taken");
            res.send('{"success" : "Player already taken", "status" : 404}');
            return;
        }
        else
        {
            gameList[req.body.gameNumber].player1taken = true;
            gameList[req.body.gameNumber].log.unshift("Player 1 has joined the game");
            generateCharacter(req.body.gameNumber, req.body.playerNumber - 1);
        }
    }
    else if(req.body.playerNumber === 2)
    {
        if (gameList[req.body.gameNumber].started === true)
        {
            res.send('{"success" : "Player already taken", "status" : 404}');
            return;
        }
        else
        {
            gameList[req.body.gameNumber].started = true;
            gameList[req.body.gameNumber].log.unshift("Player 2 has joined the game");
            generateCharacter(req.body.gameNumber, req.body.playerNumber - 1);
        }
    }
    res.send(gameList[req.body.gameNumber]);
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
    if (gameList[game].gameOver || !gameList[game].started)
    {
        res.end('{"success" : "Game already over", "status" : 200}');
        return;
    }
    //maybe add some error checking to ensure it is that players move
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
    
    //check if valid move
    //check if charged
    if (gameList[game].players[player].attacks[move].turnsUntilReady)
    {
        res.end('{"success" : "Move not ready", "status" : 200}');
        return;
    }
    if (((gameList[game].players[player].attacks[move].hp - gameList[game].players[player].attacks[move].hpCost) < 0) ||
        ((gameList[game].players[player].attacks[move].mp - gameList[game].players[player].attacks[move].mpCost) < 0)) {
        
        res.end('{"success" : "Cannot pay for move", "status" : 200}');
        return;
    }
    
    
    //perform move
    performMove(game, player, move, opponent);
    
    //send response
    res.end('{"success" : "Updated Successfully", "status" : 200}');
});


/* allows a player to quit a game */
router.post('/game/quit', function(req, res) {
    //get values
    let game = req.body.game;
    let player = req.body.player;
    if (!gameList[game].started)
    {
        gameList[game] = JSON.parse(JSON.stringify(defaultGame));
        gameList[game].number = game;
    }
    else if (!gameList[game].gameOver)
    {
        gameList[game].gameOver = true;
        if (player === 1)
        {
            gameList[game].winner == 2;
            gameList[game].log.unshift("Player 1 has quit.");
            gameList[game].log.unshift("Player 2 wins!!");
            gameList[game].playerquit[0] = true;
        }
        else
        {
            gameList[game].winner == 1;
            gameList[game].log.unshift("Player 2 has quit.");
            gameList[game].log.unshift("Player 1 wins!!");
            gameList[game].playerquit[1] = true;
        }
    }
    else
    {
        gameList[game].playerquit[player - 1] = true;
        if (gameList[game].playerquit[0] && gameList[game].playerquit[1])
        {
            gameList[game] = JSON.parse(JSON.stringify(defaultGame));
            gameList[game].number = game;
        }
    }

    //send response
    res.end('{"success" : "Updated Successfully", "status" : 200}');
});


module.exports = router;






































/* constant values */
const NUM_GAMES = 5;
const NUM_MOVES = 7
const BASE_HP = 100;
const BASE_MP = 50
const BASE_BASIC_STRENGTH = 5;
const BASE_MOVE_STRENGTH = 10;
const BASE_GREATER_MOVE_STRENGTH = 10;
const BASE_MP_COST = 7;
const BASE_HP_COST = 3;
const BASE_COOLDOWN = 1;



/* set up game list */


var gameList = [];

const defaultGame = {
        number: "0",
        started: false,
        gameOver: false,
        winner: 0,
        player1taken: false,
        player1turn: true,
        playerquit: [false, false],
        log: [],
        players: [{
                name: "player1",
                hp: 20,
                attacks: []
            },
            {
                name: "player2",
                hp: 20,
                attacks: []
            }
        ],
    };
    
const basicCharacter = {
    name: "",
    hp: BASE_HP,
    mp: BASE_MP,
    attacks: [],
};

const basicMove = {
    title: "basic",
    level: "1",
    mpCost: 0,
    hpCost: 0,
    cooldown: 0,
    turnsUntilReady: 0,
    strength: BASE_BASIC_STRENGTH,
    targetOpponent: true,
    targetSelf: false,
    damageOpponent: true,
    damageSelf: false
};

const moveList = [
    {
    title: "heal",
    level: 1,
    mpCost: BASE_MP_COST,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_MOVE_STRENGTH,
    targetOpponent: false,
    targetSelf: true,
    damageOpponent: false,
    damageSelf: false
    },
    {
    title: "fireball",
    level: 1,
    mpCost: BASE_MP_COST,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_MOVE_STRENGTH,
    targetOpponent: true,
    targetSelf: false,
    damageOpponent: true,
    damageSelf: false
    },
    {
    title: "restore",
    level: 1,
    mpCost: 0,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_GREATER_MOVE_STRENGTH,
    targetOpponent: true,
    targetSelf: true,
    damageOpponent: false,
    damageSelf: false
    },
    {
    title: "obliterate",
    level: 1,
    mpCost: BASE_MP_COST,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_GREATER_MOVE_STRENGTH,
    targetOpponent: true,
    targetSelf: true,
    damageOpponent: true,
    damageSelf: true
    },
    {
    title: "revenge",
    level: 1,
    mpCost: 0,
    hpCost: BASE_HP_COST,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_MOVE_STRENGTH,
    targetOpponent: true,
    targetSelf: false,
    damageOpponent: true,
    damageSelf: false
    },
    {
    title: "Drain Health",
    level: 1,
    mpCost: BASE_MP_COST,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_BASIC_STRENGTH,
    targetOpponent: true,
    targetSelf: true,
    damageOpponent: true,
    damageSelf: false
    },
    {
    title: "special",
    level: 1,
    mpCost: 0,
    hpCost: 0,
    cooldown: BASE_COOLDOWN,
    turnsUntilReady: 0,
    strength: BASE_MOVE_STRENGTH,
    targetOpponent: true,
    targetSelf: false,
    damageOpponent: true,
    damageSelf: false
    }
    ];
    //could add attack to convert health to manna
    //add mana drain attack
    //add health drain attack
const gameListInit = function() {
    for (let i = 0; i < NUM_GAMES; ++i)
    {
        gameList.push(JSON.parse(JSON.stringify(defaultGame)));
        gameList[i].number = i;
    }
};

gameListInit();

/* helperFunctions */
//generate move
const generateMove = (game, player, level) => {
    //randomly select move to add
    let i = Math.floor((Math.random() * NUM_MOVES));
    //add move to correct players attacks
    gameList[game].players[player].attacks.push(JSON.parse(JSON.stringify(moveList[i])));
    //get index of move in attacks array
    let moveIndex = gameList[game].players[player].attacks.length - 1;
    gameList[game].players[player].attacks[moveIndex].index = moveIndex;
    //check if it is a special
    if (gameList[game].players[player].attacks[moveIndex].title != "special")
    {
        //if it is not start working in random adjusts
        //set move level
        gameList[game].players[player].attacks[moveIndex].level = level;
        //check if move has mp cost
        if (gameList[game].players[player].attacks[moveIndex].mpCost)
        {
           gameList[game].players[player].attacks[moveIndex].mpCost += Math.floor((Math.random() * 5)) -2;
           gameList[game].players[player].attacks[moveIndex].mpCost *= level;
        }
        //check if it has an hp cost
        if (gameList[game].players[player].attacks[moveIndex].hpCost)
        {
           //add random adjust to hpCost and set cost by level
           gameList[game].players[player].attacks[moveIndex].hpCost += Math.floor((Math.random() * 5)) -2;
           gameList[game].players[player].attacks[moveIndex].hpCost *= level;
        }
        //add random adjust to cooldown time
        gameList[game].players[player].attacks[moveIndex].cooldown += level + Math.floor((Math.random() * 5)) -2;
        //set starting turns until ready
        gameList[game].players[player].attacks[moveIndex].turnsUntilReady = gameList[game].players[player].attacks[moveIndex].cooldown;
        //add random adjust to strength
        gameList[game].players[player].attacks[moveIndex].strength += Math.floor((Math.random() * 5)) -2;
        //set strength by level
        gameList[game].players[player].attacks[moveIndex].strength *= level;
    }
    else
    {
        //don't forget to set spectial name
        
        //get special level
        let specialLevel = level + Math.floor((Math.random() * 2));
        //set move level
        gameList[game].players[player].attacks[moveIndex].level = specialLevel;
        gameList[game].players[player].attacks[moveIndex].mpCost += Math.floor((Math.random() * specialLevel*15));
        gameList[game].players[player].attacks[moveIndex].hpCost += Math.floor((Math.random() * specialLevel*12));
        //add random adjust to cooldown time
        gameList[game].players[player].attacks[moveIndex].cooldown += specialLevel + Math.floor((Math.random() * specialLevel*2));
        //set starting turns until ready
        gameList[game].players[player].attacks[moveIndex].turnsUntilReady = gameList[game].players[player].attacks[moveIndex].cooldown;
        //add random adjust to strength
        gameList[game].players[player].attacks[moveIndex].strength += Math.floor((Math.random() * specialLevel*15)) + 1;
    }
};

//create Character
const generateCharacter = (game, player) => {
    gameList[game].players[player] = JSON.parse(JSON.stringify(basicCharacter));
    gameList[game].players[player].attacks.push(JSON.parse(JSON.stringify(basicMove)));
    generateMove(game, player, 1);
    generateMove(game, player, 2);
    gameList[game].players[player].hp += Math.floor((Math.random() * 41)) -20;
    gameList[game].players[player].mp += Math.floor((Math.random() * 41)) -20;
};

//perform move
const performMove = (game, player, moveIndex, opponent) => {
    let hpCost = gameList[game].players[player].attacks[moveIndex].hpCost;
    let mpCost = gameList[game].players[player].attacks[moveIndex].mpCost;
    let strength = gameList[game].players[player].attacks[moveIndex].strength;
    let title = gameList[game].players[player].attacks[moveIndex].title;
    if (hpCost && mpCost) {
        gameList[game].log.unshift(gameList[game].players[player].name + " has paid " + mpCost +" mp and " + hpCost + " hp to perform " + title);
    }
    else if (mpCost) {
        gameList[game].log.unshift(gameList[game].players[player].name + " has paid " + mpCost +" mp to perform " + title);
    }
    else if (hpCost) {
        gameList[game].log.unshift(gameList[game].players[player].name + " has paid " + hpCost + " hp to perform " + title);
    }
    else {
        gameList[game].log.unshift(gameList[game].players[player].name + " performs " + title);
    }
    //spend hp and mp
    gameList[game].players[player].hp -= hpCost;
    gameList[game].players[player].mp -= mpCost;
    //check if targets opponent
    if (gameList[game].players[player].attacks[moveIndex].targetOpponent) {
        //check if damages opponent
        if (gameList[game].players[player].attacks[moveIndex].damageOpponent) {
            gameList[game].players[opponent].hp -= strength;
            gameList[game].log.unshift(gameList[game].players[opponent].name + " takes " + strength + " damage");
        }
        //else heal opponent
        else {
            gameList[game].players[opponent].hp += strength;
            gameList[game].log.unshift(gameList[game].players[opponent].name + " takes " + strength + " damage");
        }
    }
    //check if move tagets self
    if (gameList[game].players[player].attacks[moveIndex].targetSelf) {
        //check if damages self
        if (gameList[game].players[player].attacks[moveIndex].damageSelf) {
            gameList[game].players[player].hp -= strength;
            gameList[game].log.unshift(gameList[game].players[player].name + " takes " + strength + " damage");
        }
        //else heal self
        else {
            gameList[game].players[player].hp += strength;
            gameList[game].log.unshift(gameList[game].players[player].name + " gains " + strength + " hp");
        }
    }
    //update move cooldowns
    gameList[game].players[player].attacks[moveIndex].turnsUntilReady = gameList[game].players[player].attacks[moveIndex].cooldown;
    for (let i = 0; i < gameList[game].players[player].attacks.length; ++i)
    {
        console.log("at " + i);
        if ((i != moveIndex) && (gameList[game].players[player].attacks[i].turnsUntilReady))
        {
            console.log("in update");
            gameList[game].players[player].attacks[i].turnsUntilReady--;
        }
    }
    
    //check if game is over
    checkGameOver(game);
    
    //update who's turn it is
    gameList[game].player1turn = !gameList[game].player1turn;
};

//checks if game is over and updates game
const checkGameOver = (game) => {
    if ((gameList[game].players[0].hp <= 0) &&
        (gameList[game].players[1].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 0;
            gameList[game].log.unshift("Player 1 and Player 2 have died.");
            gameList[game].log.unshift("The Game is a draw");
        }
    else if ((gameList[game].players[0].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 2;
            gameList[game].log.unshift("Player 1 has died.");
            gameList[game].log.unshift("Player 2 wins!!");
        }
    else if ((gameList[game].players[1].hp <= 0))
        {
            gameList[game].gameOver = true;
            gameList[game].winner = 1;
            gameList[game].log.unshift("Player 2 has died.");
            gameList[game].log.unshift("Player 1 wins!!");
        }
};