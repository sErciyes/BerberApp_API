import * as signalR from "@microsoft/signalr";
import { getToken } from "../utils/tokenStorage";

const hubURL = import.meta.env.VITE_CHAT_HUB_URL ?? "http://localhost:5159/hubs/chat";

export function createChatConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(hubURL, {
      accessTokenFactory: () => getToken() ?? ""
    })
    .withAutomaticReconnect()
    .build();
}
