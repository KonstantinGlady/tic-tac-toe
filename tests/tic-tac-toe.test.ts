import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

function createGame(
  betAmount: number,
  moveIndex: number,
  move: number,
  user: string
) {

  return simnet.callPublicFn(
    "tic-tac-toe",
    "create-game",
    [Cl.uint(betAmount), Cl.uint(moveIndex), Cl.uint(move)],
    user
  );
}

function joinGame(moveIndex: number, move: number, user: string) {
 
  return simnet.callPublicFn(
    "tic-tac-toe",
    "join-game",
    [Cl.uint(0), Cl.uint(moveIndex), Cl.uint(move)],
    user
  );
}

function play(moveIndex: number, move:number, player: string) {

  return simnet.callPublicFn(
    "tic-tac-toe",
    "play",
    [Cl.uint(0), Cl.uint(moveIndex), Cl.uint(move)],
    player
  );
}

describe("Tic Tac Toe Tests", () => {

  it("allows game creation", () => {
    const { result, events } = createGame(100, 0, 1, alice); 

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2);
  });

  it("allows game joining", () => {
    createGame(100, 0, 1, alice);
    const { result, events } = joinGame(1, 2, bob);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2);
  });

  it("allows game playing", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result, events } = play(2 ,1 , alice);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(1);
  });

  it("does not allow creating a game with a bet amount of 0", () => {
    const { result } = createGame(0, 0, 1, alice);
    expect(result).toBeErr(Cl.uint(100));
  });

  it("does not allow joining a game that has already been joined", () => {
      createGame(100, 0, 1, alice);
      joinGame(1, 2, bob);

      const { result } = joinGame(1, 2, alice);
      expect(result).toBeErr(Cl.uint(103));
  });

  it("does not allow an out of bound move", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const {result} = play(10, 1, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("does not allow a non X or O move", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = play(2, 3, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("does not allow moving on a occupied spot", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = play(1, 1, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("allows player one to win", () => { 
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
   
    play(1, 1, alice);
    play(4, 2, bob);

    const { result, events } = play(2, 1, alice);
    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2);

    const gameData = simnet.getMapEntry("tic-tac-toe", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(false),
        "bet-amount": Cl.uint(100),

        board: Cl.list([
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0)
        ]),

        winner: Cl.some(Cl.principal(alice)),
      })
    );
  });

  it("allows player two to win", () => {
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    
    play(1, 1, alice);
    play(4, 2, bob);
    play(8, 1, alice);

    const {result, events } = play(5, 2, bob);
    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2);

    const gameData = simnet.getMapEntry("tic-tac-toe", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(true),
        "bet-amount": Cl.uint(100),

        board: Cl.list([
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(0),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(1),
        ]),
        
        winner: Cl.some(Cl.principal(bob)),
      })
    );
  });
});