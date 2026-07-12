import type {Server, Socket} from "socket.io";
import type {PresencePayload} from "@realtime-chat/shared";
import {SERVER_EVENTS} from "@realtime-chat/shared";

export class PresenceRegistry {
  private readonly socketsByUser = new Map<string, Set<string>>();

  join(username: string, socketId: string): void {
    const sockets = this.socketsByUser.get(username) ?? new Set<string>();
    sockets.add(socketId);
    this.socketsByUser.set(username, sockets);
  }

  leave(username: string, socketId: string): void {
    const sockets = this.socketsByUser.get(username);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) this.socketsByUser.delete(username);
  }

  payload(): PresencePayload {
    const users = [...this.socketsByUser.keys()].sort((a, b) => a.localeCompare(b));
    return {users, count: users.length};
  }

  emit(io: Server): void {
    io.emit(SERVER_EVENTS.presence, this.payload());
  }

  emitToUser(io: Server, username: string, event: string, payload: unknown): void {
    const sockets = this.socketsByUser.get(username);
    sockets?.forEach((socketId) => io.to(socketId).emit(event, payload));
  }

  leaveSocket(socket: Socket): string | undefined {
    const username = socket.data.username as string | undefined;
    if (username) this.leave(username, socket.id);
    return username;
  }
}
