/* global Vue */
/* global axios */
/* global fetch */

let app = new Vue({
    el: '#game',
    data: {
        gamelist: [],
        inGame: false,
        playerNumber: 0,
        game: {},
        resetPassword: "password",
    },
    created: function() {
        this.getGameList();
    },
    computed: {
        watching() {
            if (this.playerNumber === 0) {
                return true;
            }
            else {
                return false;
            }
        },
        yourTurn() {
            if (this.game.player1turn === undefined) {
                return;
            }
            else if ((this.game.player1turn === true) && (this.playerNumber === 1)) {
                return true;
            }
            else if ((this.game.player1turn === true) && (this.playerNumber != 1)) {
                return false;
            }
            else if ((this.game.player1turn === false) && (this.playerNumber === 2)) {
                return true;
            }
            else {
                return false;
            }

        },
    },
    methods: {
        async getGameList() {
            var url = "http://cs260.kentashby.com:4210/game/list";
            try {
                let response = await axios.get(url);
                this.gamelist = response.data;
                return true;
            }
            catch (error) {
                console.log(error);
            }
        },
        getGame(game) {
            if (!game.player1taken) {
                this.playerNumber = 1;
            }
            else if (!game.started) {
                this.playerNumber = 2;
            }
            else {
                this.playerNumber = 0;
            }
            var url = "http://cs260.kentashby.com:4210/game/start";
            axios.post(url, {
                    game: this.game.number,
                    gameNumber: game.number,
                    playerNumber: this.playerNumber
                })
                .then(response => {
                    if (response.data.success === undefined) {
                        this.game = response.data;
                        this.inGame = true;
                    }
                    else {
                        console.log("player slot already taken.");
                        this.playerNumber = 0;
                        this.getGameList();
                        this.inGame = false;
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        updateGame() {
            if (this.reseting) {
                return;
            }
            var url = "game/see?gameNumber=" + this.game.number;
            fetch(url)
                .then((data) => {
                    return (data.json());
                })
                .then((game) => {
                    this.game = game;
                    this.inGame = true;
                });
        },
        resetGames() {
            var url = "http://cs260.kentashby.com:4210/game/reset";
            axios.post(url, { password: this.resetPassword })
                .then(response => {
                    if (response.data.success === "Updated Successfully") {
                        this.inGame = false;
                        this.playerNumber = 0;
                        this.getGameList();
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        },
        makeAttack(index) {
            if (!this.yourTurn) {
                return;
            }
            var url = "http://cs260.kentashby.com:4210/game/move";
            axios.post(url, {
                    game: this.game.number,
                    move: index,
                    player: this.playerNumber
                })
                .then(response => {
                    this.updateGame();
                })
                .catch(e => {
                    console.log(e);
                });
        },
        quitGame() {
            if(!this.inGame)
            {
                return;
            }
            var url = "http://cs260.kentashby.com:4210/game/quit";
            axios.post(url, {
                    game: this.game.number,
                    player: this.playerNumber
                })
                .then(response => {
                    this.inGame = false;
                    this.getGameList();
                })
                .catch(e => {
                    console.log(e);
                });
            
        },
        returnToGameList() {
            this.inGame = false;
            this.getGameList();
        },
        
    },
    mounted: function() {
        window.setInterval(() => {
            if (!this.inGame) {
                this.getGameList();
            }
            else {
                this.updateGame();
            }
        }, 2500);
    }
});
