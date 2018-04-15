var Controller = function(maze) {
    var self = this;
    this.input = new Input(document.getElementsByTagName("body")[0])
    this.maze = maze;
    this.maze.addEventObserver(this);
    this.speed = 1000 / 5;

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
    this.input
        .watch("arrowup",    function() { move(self.player1, "up") }, "ArrowUp")
        .watch("arrowdown",  function() { move(self.player1, "down") }, "ArrowDown")
        .watch("arrowleft",  function() { move(self.player1, "left") }, "ArrowLeft")
        .watch("arrowright", function() { move(self.player1, "right") }, "ArrowRight")
        .watch("w",          function() { move(self.player2, "up") }, "w")
        .watch("s",          function() { move(self.player2, "down") }, "s")
        .watch("a",          function() { move(self.player2, "left") }, "a")
        .watch("d",          function() { move(self.player2, "right") }, "d")
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
    }
}

