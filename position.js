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
    },

    isSame : function(pos) {
        return pos.x == this.x && pos.y == this.y;
    }
}

