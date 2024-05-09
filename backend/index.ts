import { Data } from "./types";
import { MQueue } from "./queue";
import { Serial } from "./serial";
import { Socket } from "./socket";

const queue = new MQueue<Data>();
const serial = new Serial();

serial.subscribe((data) => queue.publish(data));

const socket = new Socket(5001);

socket.onConnection((ws) => {
  ws.on("message", (data) => {
    console.log("[Sending to Arduino]: ", data.toString());
    serial.write(data.toString());
  });
  queue.subscribe((data) => ws.send(JSON.stringify(data)));
});
