import { axiosClient } from "./axiosClient";
import type { ApiResponse } from "../types/apiResponse";
import type { ChatMessage, Conversation } from "../types/chat";

export async function getConversations() {
  const response = await axiosClient.get<ApiResponse<Conversation[]>>("/conversations");
  return response.data;
}

export async function createConversation(barberId: number) {
  const response = await axiosClient.post<ApiResponse<Conversation>>("/conversations", { barberId });
  return response.data;
}

export async function getMessages(conversationId: number) {
  const response = await axiosClient.get<ApiResponse<ChatMessage[]>>(`/conversations/${conversationId}/messages`);
  return response.data;
}

export async function markConversationAsRead(conversationId: number) {
  const response = await axiosClient.patch<ApiResponse<boolean>>(`/conversations/${conversationId}/read`);
  return response.data;
}
