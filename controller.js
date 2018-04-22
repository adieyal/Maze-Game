
var Controller = function(maze) {
    var self = this;
    this.input = new Input(document.getElementsByTagName("body")[0])
    this.maze = maze;
    this.maze.addEventObserver(this);
    this.speed = 1000 / 5;
    this.prev_date = null;
    this.prev_pos = null;
    
    var actionMapper = function(gesture) {
        var player = self.player2;
        var new_date = new Date();
        if (this.handPos && this.handPos[0] == 0 && this.handPos[1] == 0)
            return;

        if (this.prev_date) {
            var time = new_date.getTime();
            if (time - this.prev_date.getTime() < 50) {
                return
            }
        }
        this.prev_date = new_date;
        if (this.prev_pos) {
            var x_diff = this.prev_pos[0] - gesture.handPos[0];
            var y_diff = this.prev_pos[1] - gesture.handPos[1];
            var x_abs = Math.abs(x_diff);
            var y_abs = Math.abs(y_diff);
            var min_threshold = 8;
            var max_threshold = 15;
            var move = false;
            if (x_abs > min_threshold && x_abs < max_threshold) {
                console.log("x diff: " + x_diff + " x abs: " + x_abs)
                move = true;
                if (x_diff < 0)
                    self.maze.movePlayer(player, player.pos.left());
                else if (x_diff > 0)
                    self.maze.movePlayer(player, player.pos.right());
            }
            else if (y_abs > min_threshold && y_abs < max_threshold) {
                move = true;
                console.log("y diff: " + y_diff + " y abs: " + y_abs)
                if (y_diff < 0)
                    self.maze.movePlayer(player, player.pos.down());
                else if (y_diff > 0)
                    self.maze.movePlayer(player, player.pos.up());
            }

            this.prev_pos = gesture.handPos;
            if (move) return;
        }
        
        this.prev_pos = gesture.handPos;

        if (gesture.isLeft)
            self.maze.movePlayer(player, player.pos.right());
        if (gesture.isRight)
            self.maze.movePlayer(player, player.pos.left());
        if (gesture.isUp)
            self.maze.movePlayer(player, player.pos.up());
        if (gesture.isDown)
            self.maze.movePlayer(player, player.pos.down());
    }
    this.init_gestures(actionMapper);

    var moveGhosts = function() {
        for (idx in maze.ghosts) {
            var ghost = maze.ghosts[idx];
            ghost.nextMove();
        }
    }
    this.ghost_interval = setInterval(moveGhosts, this.speed);

    var move = function(player, direction) {
        switch (direction) {
            case "left"  : self.maze.movePlayer(player, player.pos.left()); break;
            case "right" : self.maze.movePlayer(player, player.pos.right()); break;
            case "up"    : self.maze.movePlayer(player, player.pos.up()); break;
            case "down"  : self.maze.movePlayer(player, player.pos.down()); break;
        }
    }

    var clear = function() {
        console.log("Clearing");
        this.input = {};
    }

    this.input
        .watch("arrowup",    function() { move(self.player1, "up") }, "ArrowUp")
        .watch("arrowdown",  function() { move(self.player1, "down") }, "ArrowDown")
        .watch("arrowleft",  function() { move(self.player1, "left") }, "ArrowLeft")
        .watch("arrowright", function() { move(self.player1, "right") }, "ArrowRight")

        .watch("w",          function() { move(self.player2, "up") }, "w")
        .watch("s",          function() { move(self.player2, "down") }, "s")
        .watch("a",          function() { move(self.player2, "left") }, "a")
        .watch("d",          function() { move(self.player2, "right") }, "d")
        .watch("W",          function() { move(self.player2, "up") }, "W")
        .watch("S",          function() { move(self.player2, "down") }, "S")
        .watch("A",          function() { move(self.player2, "left") }, "A")
        .watch("D",          function() { move(self.player2, "right") }, "D")
        .watch("spacebar",   function() { clear() }, " ")
}

Controller.prototype = {
    notify : function(data, event_label) {
        if (event_label == "player_added") {
            this.player1 = this.maze.players[0]

            if (this.maze.players.length > 1)
                this.player2 = this.maze.players[1]
        }
        else if (event_label == "player_gobbled") {
            var new_pos = this.maze.selectFree();
            this.maze.movePlayer(data.player, new_pos);
        }
    },

    init_gestures : function(actionMapper) {
        JSHG.init({
            "actionCallback": actionMapper,
            "learnDivId": "gestureShownHere",
            "gestureDivId": "gestureShownHere",
            "settings": {
                "cameraWidth": 500,
                "cameraHeight": 400,
                "gestureDisplayWidth": 100,
                "gestureDisplayHeight": 80,
                "centralAreaRatio" : 1/3,
            }
        })
        JSHG.learnSkinColor()
        JSHG.run();
    }
}

