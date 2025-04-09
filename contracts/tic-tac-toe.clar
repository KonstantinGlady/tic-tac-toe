
(define-constant THIS_CONTRACT (as-contract tx-sender))
(define-constant ERR_MIN_BET_AMOUNT u100)
(define-constant ERR_INVALID_MOVE u101)
(define-constant ERR_GAME_NOT_FOUND u1002)
(define-constant ERR_GAME_CANNOT_BE_JOINED u103)
(define-constant ERR_NOT_YOUR_TURN u104)

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

(define-public (create-game (bet-amount uint) (move-index uint) (move uint))
    (let (
        (game-id (var-get latest-game-id))
        (starting-board (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
        (game-board (unwrap! (replace-at? starting-board move-index move) (err ERR_INVALID_MOVE)))

        (game-data {
            player-one: contract-caller,
            player-two: none,
            is-player-one-turn: false,
            bet-amount: bet-amount,
            board: game-board,
            winner: none
        })
    )
    
    (asserts! (> bett-amount u0) (err ERR_MIN_BET_AMOUNT))
    (asserts! (is-eq move u1) (err ERR_INVALID_MOVE))
    (asserts! (validate-move starting-board move-index move) (err ERR_INVALID_MOVE))

    (try! (stx-transfer? bet-amount contract-caller THIS_CONTRACT))
    (map-set games game-id game-data)
    (var-set latest-game-id (+ game-id u1))

    (print {action: "create-game", data: game-data})

    (ok game-id)
    ))

(define-public (join-game (game-id uint) (move-index uint) (move uint))
    (let (

        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        (original-board (get board original-game-data))
        (game-board (unwrap! (replace-at? original-board move-index move) (err ERR_INVALID_MOVE)))
        (game-data (merge original-game-data {
            board: game-board,
            player-two: (some contract-caller),
            is-player-one-turn: true
        }))
    )
    
    (asserts! (is-none (get player-two original-game-data)) (err ERR_GAME_CANNOT_BE_JOINED))
    (asserts! (is-eq move u2) (err ERR_INVALID_MOVE))
    (asserts! (validata-move original-board move-index move) (err ERR_INVALID_MOVE))
    (try! (stx-transfer? (get bet-amount original-game-data) contract-caller THIS_CONTRACT))
    
    (maps-set games game-id game-data)
    (print { action: "join-game", data: game-data})
    (ok game-id)
    )
)

(define-private (validate-move (board (list 9 uint)) (move-index uint) (move uint))
    (let (
     (index-in-range (and (>= move-index u0) (< move-index u9)))

     (x-or-o (or (is-eq move u1) (is-eq move u2)))

     (empty-spot (is-eq (unwrap! (element-at? board move-index) false) u0))
    )

    (and (is-eq index-in-range true) (is-eq x-or-o true) empty-spot)
))  




