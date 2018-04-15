var Ghost = function(maze, pos) {
    this.pos = pos;
    this.maze = maze;
    this.previous_move = null;
    this.penalty = GHOST_PENALTY;
    this.target = null;

}


Ghost.prototype = {
    nextMove : function() {
        if (!this.target || Math.random() < 0.1) {
            this.target = _.shuffle(this.maze.players)[0];
        }

        var grid = this.maze.aStarGraph.grid;
        var results = [];
        var player = this.target;
        var start = grid[this.pos.y][this.pos.x];
        var end = grid[player.pos.y][player.pos.x];
        var result = astar.search(this.maze.aStarGraph, start, end);

        if (result) {
            var node = result[0];
            this.maze.moveGhost(this, new Position(node.y, node.x));
        } else {
            this.nextMove2();
        }
    },

    nextMove2 : function() {
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

