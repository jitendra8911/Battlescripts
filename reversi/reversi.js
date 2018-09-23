// Player template
module.exports = function () {
    // Required method - move()
    this.move = function (game,me) {
        let ret = [];
        ret = this.first_valid_move(me, game.board);
        console.log(ret);
        return ret;
    }

    // Get the value of a [row,col] position on the board
    // -1 = invalid position
    // null = empty
    // 0 = player1
    // 1 = player2
    this.square_value = function(board,pos) {
        if (this.out_of_bounds(pos)) { return -1; }
        return board[pos[0]][pos[1]];
    };

    // "Walk" in one direction from a position to see how many discs could be flipped
    // Returns 0 if the move would turn no discs and is therefore invalid!
    this.walk = function(pos,dir,player,board) {
        var count = 0;
        var p = [pos[0],pos[1]];
        while (true) {
            p[0] += dir[0];
            p[1] += dir[1];
            var val = this.square_value(board,p);
            if (val==-1 || val==null) { return 0; }
            if (val == player) { return count; }
            count++;
        }
    };

    // Test if a position is out of bounds
    this.out_of_bounds = function(c) {
        return (c[0] > 7 || c[0] < 0 || c[1] > 7 || c[1] < 0);
    };

    // A general function to test if a move is valid.
    // It does this by "walking" in all 8 directions from a position to see if
    //   the number of discs that would flip is > 0
    // ex: this.is_valid(0, game.board, [0,0]) === false
    this.is_valid = function(player,board,move) {
        let moves = [ [-1,-1],[-1,0],[-1,1], [0,-1],[0,1], [1,-1],[1,0],[1,1] ];
        var count = 0;
        if (this.square_value(board,move)==null) {
            for(i=0;i<moves.length;i++) {
                count += this.walk(move,moves[i],player,board);
                if (count>0) {
                    return true;
                }
            }
        }
        return count > 0;
    };

    this.total_no_flipped_pieces = function(player,board,move) {
        let moves = [ [-1,-1],[-1,0],[-1,1], [0,-1],[0,1], [1,-1],[1,0],[1,1] ];
        var count = 0;
        if (this.square_value(board,move)==null) {
            for(i=0;i<moves.length;i++) {
                count += this.walk(move,moves[i],player,board);
            }
        }

        return count;

    };


    // A simple function to find and return the first valid move.
    // Starts at the upper left and takes the first available square
    this.first_valid_move = function(player,board) {
        corners = [[0,0], [0,7], [7,0], [7,7]];
        second_squares = [[0,2], [0,5], [2,0], [2,7], [5,0], [5,7], [7,2], [7,5]];
        third_squares = [[2,2], [2,5], [5,2], [5,5]];
        fourth_squares = [[0,1], [0,6], [1,0], [1,7], [6,0], [6,7], [7,1], [7,6]];
        diagonal_adj_squares = [[1,1], [1,6], [6,1], [6,6]];
        count = 0;
        best_move = [0,0];
        highest_score = Number.NEGATIVE_INFINITY;
        available_moves = [];

        for(var row=0; row<8; row++) {
            for (var col=0; col<8; col++) {
                let move_stats = {};
                move_stats['move'] = [row,col];
                move_stats['score'] = 0;
                move_flip_count = this.total_no_flipped_pieces(player,board,move_stats['move']);
                score = 0;
                if (move_flip_count > 0) {

                    score += 1; // for having flip count greater than 0
                    move_stats['score'] += 1;

                    // increment score by 5 if it is corner
                    // increment score by 3 if it is second_square
                    // increment score by 2 if it is third_square
                    // decrement score by 1 if it is fourth_square

                    if (this.contains_square(corners, move_stats['move'])) {
                        score += 5;
                        move_stats['score'] += 5;
                    }

                    else if (this.contains_square(second_squares, move_stats['move'])) {
                        score += 3;
                        move_stats['score'] += 3;
                    }

                    else if (this.contains_square(third_squares, move_stats['move'])) {
                        score += 2;
                        move_stats['score'] += 2;
                    }

                    else if (this.contains_square(fourth_squares, move_stats['move'])) {
                        score += Number.NEGATIVE_INFINITY;
                        move_stats['score'] -= 100;
                        move_stats['score'] += move_flip_count;
                    }

                    else if (this.contains_square(diagonal_adj_squares, move_stats['move'])) {
                        score += Number.NEGATIVE_INFINITY;
                        move_stats['score'] -= 200;
                        move_stats['score'] += move_flip_count;
                    }


                    if (move_flip_count > count) {
                        count = move_flip_count;
                        score += count;
                    }

                    if (score > highest_score) {
                        highest_score = score;
                        best_move = move_stats['move'];
                    }

                    available_moves.push(move_stats);

                }
            }
        }


        if (highest_score === Number.NEGATIVE_INFINITY) {

            let score = Number.NEGATIVE_INFINITY;
            for (let i=0; i<available_moves.length; i++) {
                if (available_moves[i]['score'] > score) {
                    best_move = available_moves[i]['move'];
                    score = available_moves[i]['score'];
                }
            }
        }



        return best_move;
    };


    this.contains_square = function(squares, square) {
        squares = JSON.stringify(squares);
        square = JSON.stringify(square);

        return squares.includes(square);
    }

}