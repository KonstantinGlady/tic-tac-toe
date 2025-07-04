import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3GD1EJYRBZNPZVXWBK6E9ST7RJ648D7GH6T3CR7";
const CONTRACT_NAME = "tic-tac-toe";

type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
};

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];

export async function getAllGames() {
    
    const latestGameIdCV = (await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-latest-game-id",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    })) as UIntCV;
  
    const latestGameId = parseInt(latestGameIdCV.value.toString());
  
    const games: Game[] = [];
    for (let i = 0; i < latestGameId; i++) {
      const game = await getGame(i);
      if (game) games.push(game);
    }
    return games;
  }
  
  export async function getGame(gameId: number) {

    const gameDetails = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-game",
      functionArgs: [uintCV(gameId)],
      senderAddress: CONTRACT_ADDRESS,
      network: STACKS_TESTNET,
    });
  
    const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;

    if (responseCV.type === "none") return null;
    if (responseCV.value.type !== "tuple") return null;
  
    const gameCV = responseCV.value.value;
  
    const game: Game = {
      id: gameId,
      "player-one": gameCV["player-one"].value,
      "player-two":
        gameCV["player-two"].type === "some"
          ? gameCV["player-two"].value.value
          : null,
      "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
      "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
      board: gameCV["board"].value.map((cell) => parseInt(cell.value.toString())),
      winner:
        gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
    };
    return game;
  }

  
export async function createNewGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "create-game",
      functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }
  
  export async function joinGame(gameId: number, moveIndex: number, move: Move) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "join-game",
      functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }
  
  export async function play(gameId: number, moveIndex: number, move: Move) {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "play",
      functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
    };
  
    return txOptions;
  }
  