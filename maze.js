var container = d3.select("#container")
//var audio_wall = new Audio('wall-hit2.mp3');
//var audio_yahoo = new Audio('yahoo.mp3');

var PRIZE_VALUE = 100;
var GHOST_PENALTY = 100;

var Maze = function(data) {
    this.data = data;
    this.aStarGraph = this.genAStarGraph(data);
    this.players = [];
    this.targets = [];
    this.observers = [];
    this.ghosts = [];
}

Maze.prototype = {
    genAStarGraph : function(data) {
        var astar_data = _.map(data, function(row) {
            return _.map(row, function(el) { return 1 - el;})
        })
        return new Graph(astar_data);
    },

    addPlayer : function(player) {
        this.players.push(player)
        this.notifyObservers(player, "player_added")
    },

    addGhost : function(ghost) {
        this.ghosts.push(ghost)
        this.notifyObservers(ghost, "ghost_added")
    },

    addPrize : function(prize) {
        if (this.isEmpty(prize.pos)) {
            this.targets.push(prize)
            this.data[prize.pos.y][prize.pos.x] = prize;
            this.notifyObservers(prize, "prize_added")
            return true;
        }

        return false;
    },

    selectFree : function() {
        var h = this.data.length;
        var w = this.data[0].length;
        while (true) {
            // TODO Give up after a certain number of tries
            x = _.random(0, w - 1);
            y = _.random(0, h - 1);
            pos = new Position(x, y);

            if (this.isEmpty(pos)) {
                return pos
            }
        }
    },

    isWall : function(pos) {
        return this.data[pos.y][pos.x] == WALL
    },

    isEmpty : function(pos) {
        return this.data[pos.y][pos.x] == EMPTY_SPACE
    },

    isFree : function(pos, objects) {
        if (objects == null)
            objects = this.players.concat(this.ghosts);

        var has_object = _.map(objects, function(object) {
            return pos.isSame(object.pos)
        })
        if (_.any(has_object)) return false;

        var value = this.data[pos.y][pos.x]
        if (value == WALL) {
            return false
        }

        return true;
    },

    updateScore : function(player, score) {
        player.score += score;
        this.notifyObservers({player:player}, "player_scored");
    },

    moveObject : function(object, pos) {
        var value = this.data[pos.y][pos.x]
        var new_pos = pos;
        var old_pos = object.pos;
        object.pos = pos;
    },

    moveGhost : function(ghost, new_pos) {
        var old_pos = ghost.pos;
        var self = this;
        this.moveObject(ghost, new_pos);
        if (!this.isFree(new_pos, this.players)) {
            _.each(this.players, function(player) {
                if (new_pos.isSame(player.pos)) {
                    self.notifyObservers({ghost:ghost, player:player, pos:new_pos}, "player_gobbled")
                    self.updateScore(player, -ghost.penalty);
                }
            })
        } 
        this.notifyObservers({ghost:ghost, old_pos:old_pos, new_pos:new_pos}, "ghost_moved")
    },

    movePlayer : function(player, new_pos) {
        var self = this;
        if (!this.isFree(new_pos, this.ghosts)) {
            _.each(this.ghosts, function(ghost) {
                if (new_pos.isSame(ghost.pos)) {
                    self.notifyObservers({ghost:ghost, player:player, pos:new_pos}, "player_gobbled")
                    self.updateScore(player, -ghost.penalty);
                    return;
                }
            })
        }

        if (this.isFree(new_pos)) {
            var old_pos = player.pos;
            player.pos = new_pos;

            var value = this.data[new_pos.y][new_pos.x]

            if (value instanceof Prize) {
                this.data[new_pos.y][new_pos.x] = EMPTY_SPACE;
                this.notifyObservers({player:player, prize:value}, "prize_acquired")
                this.updateScore(player, value.value);
                this.addPrize( new Prize(this.selectFree(), PRIZE_VALUE));
            }

            this.notifyObservers({player:player, old_pos:old_pos, new_pos:new_pos}, "player_moved")
            return true;
        }
    },

    notifyObservers : function(data, event_label) {
        _.each(this.observers, function(o) {
            o.notify(data, event_label);
        })
    },

    addEventObserver : function(observer) {
        this.observers.push(observer);
    }
}

var Player = function(pos) {
    Player.count++;
    this.name = "player" + Player.count;
    this.css_class = this.name;
    this.score = 0;
    this.pos = pos;
}

Player.count = 0;

var Prize = function(pos, value) {
    this.pos = pos;
    var prizes = [
        { "class" : "apple", "points" : 25},
        { "class" : "orange", "points" : 50},
        { "class" : "strawberry", "points" : 100},
        { "class" : "plum", "points" : 150}
    ]

    var prize_idx = _.random(0, prizes.length - 1);
    this.class_ = prizes[prize_idx]["class"];
    this.value = prizes[prize_idx]["points"];
}


var init_maze = function() {
    console.log("Init maze");
    d3.select("#container #maze").remove();
    maze = new Maze(generate_maze(width, height, complexity, density));
    var renderer = new MazeRenderer(container, maze);
    var controller = new Controller(maze);

    maze.addPlayer(
        new Player(maze.selectFree())
    );

    maze.addPlayer(
        new Player(maze.selectFree())
    );

    var prize = new Prize(maze.selectFree(), PRIZE_VALUE);
    maze.addPrize(prize);

/*
    maze.addGhost(new Ghost(maze, maze.selectFree()))
    maze.addGhost(new Ghost(maze, maze.selectFree()))
    maze.addGhost(new Ghost(maze, maze.selectFree()))
    maze.addGhost(new Ghost(maze, maze.selectFree()))
    */
}

var width = 105, height = 51, complexity = 0.05, density = 0.05;
var maze = null;
onload = function() {
    init_maze();
}
