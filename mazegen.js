var generate_maze = function(width, height, complexity, density) {
    var WALL = 1;
    var EMPTY = 0;

    var create_empty_maze = function(width, height) {
        Z = math.zeros(height, width)

        top_border = Z.subset(math.index(0, math.range(0, width))).map(wall)
        Z.subset(math.index(0, math.range(0, width)), top_border)

        bottom_border = Z.subset(math.index(height - 1, math.range(0, width))).map(wall)
        Z.subset(math.index(height - 1, math.range(0, width)), bottom_border)

        left_border = Z.subset(math.index(math.range(0, height), 0)).map(wall)
        Z.subset(math.index(math.range(0, height), 0), left_border)

        right_border = Z.subset(math.index(math.range(0, height), width - 1)).map(wall)
        Z.subset(math.index(math.range(0, height), width - 1), right_border)

        return Z;
    }
    
    var intdiv = function(numerator, denominator) {
        return Math.floor(numerator / denominator)
    }

    var wall = function() { return WALL; }

    width = width || 81;
    height = height || 51;
    complexity = complexity || 0.75;
    density = density || 0.75;
    complexity = 0.15;
    density = 0.1;

    // only odd shapes
    shape = [intdiv(height, 2) * 2 + 1, intdiv(width, 2) * 2 + 1]
    complexity = Math.floor(complexity * (5 * (shape[0] + shape[1])))
    density = Math.floor(density * intdiv(shape[0], 2) * intdiv(shape[1], 2))

    Z = create_empty_maze(width, height);
    var set_cell = function(x, y, val) {
        Z.subset(math.index(y, x), val)
    }

    var set_wall = function(x, y) {
        set_cell(x, y, WALL);
    }

    var is_wall = function(x, y) {
        return Z.subset(math.index(y, x)) == WALL;
    }

    var is_empty = function(x, y) {
        return !is_wall(x, y);
    }

    var get_neighbours = function(x, y) {
        position = {
            left : function(x, y)  { return [y, x - 2] },
            right : function(x, y) { return [y, x + 2] },
            up : function(x, y)    { return [y - 2, x] },
            down : function(x, y)  { return [y + 2, x] }
        }
        neighbours = []

        if (x > 1)
            neighbours.push(position.left(x, y))
        if (x < shape[1] - 2)
            neighbours.push(position.right(x, y))
        if (y > 1)
            neighbours.push(position.up(x, y))
        if (y < shape[0] - 2)
            neighbours.push(position.down(x, y))

        return neighbours;
    }

    for (var i = 0; i < density; i++) {
        y = _.random(0, intdiv(shape[0], 2)) * 2
        x = _.random(0, intdiv(shape[1], 2)) * 2
        set_wall(x, y);

        for (var j = 0; j < complexity; j++) {
            var neighbours = get_neighbours(x, y);

            if (neighbours.length > 0) {
                idx =  _.random(0, neighbours.length - 1);
                y_ =  neighbours[idx][0];
                x_ =  neighbours[idx][1];
                if (is_empty(x_, y_)) {
                    set_wall(x_, y_);
                    y_idx = y_ + intdiv(y - y_, 2);
                    x_idx = x_ + intdiv(x - x_, 2);
                    set_wall(x_idx, y_idx);
                    x = x_; y = y_;
                }
            }
        }
    }
    return Z.toJSON().data;
}
