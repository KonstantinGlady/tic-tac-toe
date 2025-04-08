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