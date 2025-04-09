(define-data-var latest-game-id uint u0)

(define-map games 
    uint 
    {
        player-one: principal,
        player-two: (optional principal),
        is-player-one-turn: bool,

        bet-amount: uint,
        board: (list 9 uint),
        
        winner: (optional principal)
    }
)


(define-private (validate-move (board (list 9 uint)) (move-index uint) (move uint))
    (let (
     (index-in-range (and (>= move-index u0) (< move-index u9)))

     (x-or-o (or (is-eq (move u1) (is-eq move u2))))

     (empty-spot (is-eq (unwrap! (element-at? board move-index) false) u0))
)

    (and (is-eq index-in-range true) (is-eq x-or-o true) empty-spot)
))  
