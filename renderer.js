var MazeRenderer = function(container, maze) {
    this.container = container;
    this.maze = maze;
    maze.addEventObserver(this);
    this.drawMaze();
}

MazeRenderer.prototype = {
    drawMaze : function() {
        rows = this.container
            .append("div").attr("id", "maze")
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
        switch (event_type) {
            case "player_added" : this.on_add_player(data); break;
            case "prize_added" : this.on_prize_added(data); break;
            case "player_moved" : this.on_move_player(data.player, data.old_pos, data.new_pos); break;
            case "prize_acquired" : this.on_prize_acquired(data.player, data.prize); break;
            case "ghost_added" : this.on_ghost_added(data); break;
            case "ghost_moved" : this.on_move_ghost(data.ghost, data.old_pos, data.new_pos); break;
            case "player_gobbled" : this.on_player_gobbled(data.player); break;
            case "player_scored" : this.on_player_scored(data.player); break;
        }
    },

    on_add_player : function(player) {
        this.color_xy(player.pos, player.css_class);
    },

    on_player_gobbled : function(player) {
    },

    on_ghost_added : function(ghost) {
        this.color_xy(ghost.pos, "ghost");
    },

    on_move_player : function(player, old_pos, new_pos) {
        this.color_xy(old_pos, player.css_class, false);
        this.color_xy(new_pos, player.css_class, true);
    },

    on_move_ghost : function(ghost, old_pos, new_pos) {
        this.color_xy(old_pos, "ghost", false);
        this.color_xy(old_pos, "ghost_trail", true);

        this.color_xy(new_pos, "ghost", true);
        this.color_xy(new_pos, "ghost_trail", false);
    },

    on_prize_added : function(prize) {
        this.color_xy(prize.pos, prize.class_);
        /*
        d3.select(".floating_prize")
            .style("left", pos.x * 12 + 6)
            .style("top", pos.y * 12 + 6)
            .style("width",  "20px")
            .style("height", "px")
            .classed(prize.class_, true)
        */
    },

    on_prize_acquired : function(player, prize) {
        this.color_xy(prize.pos, prize.class_, false);
        /*
        d3.select(".floating_prize")
            .classed(prize.class_, false)
            */
    },

    on_player_scored : function(player) {
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
