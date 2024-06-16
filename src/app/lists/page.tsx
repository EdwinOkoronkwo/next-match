import React from "react";
import ListsTab from "./ListsTab";
import {
  fetchCurrentUserLikeIds,
  fetchLikedMembers,
} from "../actions/likeActions";
import { Member } from "@prisma/client";

export default async function ListsPage({
  searchParams,
}: {
  searchParams: { type: string };
}) {
  const likeIds: string[] = await fetchCurrentUserLikeIds();
  const members: Member[] = await fetchLikedMembers(searchParams.type);

  return (
    <div>
      <ListsTab members={members} likeIds={likeIds} />
    </div>
  );
}
