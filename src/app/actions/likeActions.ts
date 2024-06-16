"use server";

import { auth } from "@/auth";
import { getAuthUserId } from "./authActions";
import { Member } from "@prisma/client"; // Ensure this import is correct

export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean
): Promise<void> {
  try {
    const userId = await getAuthUserId();
    if (isLiked) {
      await prisma?.like.delete({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: userId,
            targetUserId,
          },
        },
      });
    } else {
      await prisma?.like.create({
        data: {
          sourceUserId: userId,
          targetUserId,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchCurrentUserLikeIds(): Promise<string[]> {
  try {
    const userId = await getAuthUserId();
    const likeIds = await prisma?.like.findMany({
      where: {
        sourceUserId: userId,
      },
      select: {
        targetUserId: true,
      },
    });
    return likeIds?.map((like) => like.targetUserId) || [];
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchLikedMembers(type = "source"): Promise<Member[]> {
  try {
    const userId = await getAuthUserId();

    switch (type) {
      case "source":
        return await fetchSourceLikes(userId);
      case "target":
        return await fetchTargetLikes(userId);
      case "mutual":
        return await fetchMutualLikes(userId);
      default:
        return [];
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function fetchSourceLikes(userId: string): Promise<Member[]> {
  const sourceList = await prisma?.like.findMany({
    where: { sourceUserId: userId },
    select: { targetMember: true },
  });
  return sourceList?.map((x) => x.targetMember) || [];
}

async function fetchTargetLikes(userId: string): Promise<Member[]> {
  const targetList = await prisma?.like.findMany({
    where: { targetUserId: userId },
    select: { sourceMember: true },
  });
  return targetList?.map((x) => x.sourceMember) || [];
}

async function fetchMutualLikes(userId: string): Promise<Member[]> {
  const likedUsers = await prisma?.like.findMany({
    where: { sourceUserId: userId },
    select: { targetUserId: true },
  });
  const likedIds = likedUsers?.map((x) => x.targetUserId) || [];

  const mutualList = await prisma?.like.findMany({
    where: {
      AND: [{ targetUserId: userId }, { sourceUserId: { in: likedIds } }],
    },
    select: { sourceMember: true },
  });
  return mutualList?.map((x) => x.sourceMember) || [];
}
