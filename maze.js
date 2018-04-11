var width = 10;
var maze = null;
var X = 5, Y = 3;
var container = d3.select("#container")
var audio_wall = new Audio('wall-hit2.mp3');
var audio_yahoo = new Audio('yahoo.mp3');
var end_pos = null;

var Maze = function(data) {
    this.data = data;
    this.players = [];
    this.targets = [];
    this.observers = [];
}

var EMPTY_SPACE = 0;
var WALL = 1;
var PRIZE_VALUE = 100;
Maze.prototype = {
    selectFree : function() {
        var h = this.data.length;
        var w = this.data[0].length;
        while (true) {
            // TODO Give up after a certain number of tries
            x = Math.round(Math.random() * (w - 1))
            y = Math.round(Math.random() * (h - 1))
            if (this.data[y][x] == EMPTY_SPACE) {
                return new Position(x, y)
            }
        }
    },

    notify_observers : function(data, event_label) {
        for (idx in this.observers) {
            var o = this.observers[idx];
            o.notify(data, event_label);
        }
    },

    addPlayer : function(player) {
        // TODO - check that player has been placed in a legal spot.
        this.players.push(player)
        this.notify_observers(player, "player_added")
    },

    movePlayer : function(player, pos) {
        value = this.data[pos.y][pos.x]
        if (value == WALL) {
            return false
        }
        else {
            var new_pos = pos;
            var old_pos = player.pos;
            player.pos = pos;

            if (value instanceof Prize) {
                this.data[pos.y][pos.x] = EMPTY_SPACE;
                player.score += value.value
                this.notify_observers({player:player, prize:value}, "prize_acquired")
                var prize = this.addPrize(
                    new Prize(this.selectFree(), PRIZE_VALUE)
                )
            }

            this.notify_observers({player:player, old_pos:old_pos, new_pos:new_pos}, "player_moved")
            return true;
        }
    },

    addPrize : function(prize) {
        if (this.data[prize.pos.y][prize.pos.x] == EMPTY_SPACE) {
            this.targets.push(prize)
            this.data[prize.pos.y][prize.pos.x] = prize;
            this.notify_observers(prize, "prize_added")
            return true;
        }

        return false;
    },

    addEventObserver : function(observer) {
        this.observers.push(observer);
    }
}

var MazeRenderer = function(container, maze) {
    this.container = container;
    this.maze = maze;
    maze.addEventObserver(this);
    this.drawMaze();
}

MazeRenderer.prototype = {
    drawMaze : function() {
        rows = this.container
            .selectAll("div")
            .data(this.maze.data)
            .enter()
            .append("div")
                .classed("row", true)
                .each(function(row_data, idx) {
                    d3.select(this)
                        .selectAll("div")
                        .data(row_data)
                        .enter()
                        .append("div")
                            .classed("cell", true)
                            .attr("data-x", function(el, idx2) {
                                return idx2;
                            })
                            .attr("data-y", idx)
                            .style("margin-top", function(el, idx2) {
                                return 0;;

                            })
                            .style("margin-left", function(el, idx2) {
                                return 0;;
                            })
                            .classed("wall", function(el) {
                                if (el == WALL)
                                    return true;
                                return false;
                            })
                            .classed("prize", function(el) {
                                if (el instanceof Prize)
                                    return true;
                                return false;
                            })
                })
    },

    notify : function(data, event_type) {
        if (event_type == "player_added")
            this.on_add_player(data);
        else if (event_type == "prize_added")
            this.on_prize_added(data);
        else if (event_type == "player_moved")
            this.on_move_player(data.player, data.old_pos, data.new_pos);
        else if (event_type == "prize_acquired")
            this.on_prize_acquired(data.player, data.prize);
    },

    on_add_player : function(player) {
        console.log("Player added: " + player.pos)
        this.color_xy(player.pos, player.css_class);
    },

    on_move_player : function(player, old_pos, new_pos) {
        this.color_xy(old_pos, player.css_class, false);
        this.color_xy(new_pos, player.css_class, true);
    },

    on_prize_added : function(prize) {
        this.color_xy(prize.pos, "prize");
    },

    on_prize_acquired : function(player, prize) {
        this.color_xy(prize.pos, "prize", false);
        d3.select("#scores #" + player.name + "_score .value").text(player.score);
    },

    color_xy : function(pos, class_, is_add) {
        if (is_add == null)
            is_add = true;
        attributes = "[data-x='" + pos.x + "'][data-y='" + pos.y + "']"
        var el = d3
            .selectAll(attributes)
        el.classed(class_, is_add)
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

var GameObject = function(pos) {
    this.pos = pos;
}

var Prize = function(pos, value) {
    this.pos = pos;
    this.value = value;
}

var Position = function(x, y) {
    this.x = x;
    this.y = y;
}

Position.prototype = {
    up : function() {
        return new Position(this.x, this.y - 1);
    },

    down : function() {
        return new Position(this.x, this.y + 1);
    },

    left : function() {
        return new Position(this.x - 1, this.y);
    },

    right : function() {
        return new Position(this.x + 1, this.y);
    }
}

var Controller = function(maze) {
    var self = this;
    var map = {};
    self.maze = maze;

    onkeydown = onkeyup = function(e) {

        var player1 = self.maze.players[0]
        var player2 = self.maze.players[1]

        e = e || event; // to deal with IE
        map[e.key.toLowerCase()] = e.type == 'keydown';

        if (map["arrowup"])
            self.maze.movePlayer(player1, player1.pos.up());
        if (map["arrowdown"])
            self.maze.movePlayer(player1, player1.pos.down());
        if (map["arrowleft"])
            self.maze.movePlayer(player1, player1.pos.left());
        if (map["arrowright"])
            self.maze.movePlayer(player1, player1.pos.right());
        if (map["a"])
            self.maze.movePlayer(player2, player2.pos.left());
        if (map["w"])
            self.maze.movePlayer(player2, player2.pos.up());
        if (map["d"])
            self.maze.movePlayer(player2, player2.pos.right());
        if (map["s"])
            self.maze.movePlayer(player2, player2.pos.down());
    }
}

d3.json("maze2.json").then(function(data) {
    maze = new Maze(data);
    renderer = new MazeRenderer(d3.select("#container"), maze);
    controller = new Controller(maze);

    maze.addPlayer(
        new Player(maze.selectFree())
    );

    maze.addPlayer(
        new Player(maze.selectFree())
    );

    var prize = new Prize(maze.selectFree(), PRIZE_VALUE);
    maze.addPrize(prize);

})

/*
var color_xy = function(class_, x, y) {
    container.selectAll(".row").each(function(el, idx) {
        if (idx == y) {
            d3.select(this).selectAll(".cell")
                .classed(class_, function(el, idx2) {
                    if (idx2 == x) {
                        return true;
                    }
                    return false;
                })
        }
    })
}
*/

/*
var move_xy = function(x, y) {
    if (maze.data[y][x] == 0) {
        if (x == end_pos[0] && y == end_pos[1]) {
            audio_yahoo.play();
            audio_yahoo.currentTime = 0;
            color_xy("blank", end_pos[0], end_pos[1])
            end_pos = maze.selectFree();
            color_xy("end", end_pos.x, end_pos.y)

        }
        d3.selectAll(".cell").classed("position", false);
        X = x;
        Y = y;
        color_xy("position", X, Y)
    } else {
        audio_wall.play();
        audio_wall.currentTime = 0;
    }
}

*/
