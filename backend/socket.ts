import { WebSocketServer } from "ws";

export class Socket {
  wss: WebSocketServer;
  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
  }

  onConnection(onConnection: (ws: WebSocket) => void) {
    this.wss.on("connection", onConnection);
  }
}
