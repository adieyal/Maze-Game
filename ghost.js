var Ghost = function(maze, pos) {
    this.pos = pos;
    this.maze = maze;
    this.previous_move = null;
    this.penalty = GHOST_PENALTY;
}


Ghost.prototype = {
    nextMove : function() {
        var directions = ["left", "right", "up", "down"];
        if (this.previous_move) {
            for (var i = 0; i < 20; i++)
                directions.push(this.previous_move);
        }
        directions = _.shuffle(directions);

        var direction = null;
        var new_pos = null;
        while (directions.length > 0) {
            direction = directions.pop();
            switch (direction) {
                case "left" : new_pos = this.pos.left(); break;
                case "right" : new_pos = this.pos.right(); break;
                case "up" : new_pos = this.pos.up(); break;
                case "down" : new_pos = this.pos.down(); break;
            }
            if (this.maze.isFree(new_pos, []))
                break;
        }

        if (new_pos) {
            this.previous_move = direction;
            this.maze.moveGhost(this, new_pos);
        }
    }
}

