import { Data } from "./types";
import { MQueue } from "./queue";
import { Serial } from "./serial";
import { Socket } from "./socket";

const queue = new MQueue<Data>();
const serial = new Serial();

serial.subscribe((data) => queue.publish(data));

const socket = new Socket(5001);

socket.onConnection((ws) =>
  queue.subscribe((data) => ws.send(JSON.stringify(data))),
);
