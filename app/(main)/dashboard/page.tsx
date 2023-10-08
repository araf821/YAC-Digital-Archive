import UserPostsSection from "@/components/post/UserPostsSection";
import { dateFormat } from "@/lib/dateFormat";
import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import Image from "next/image";

const DashboardPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const currentUser = await db.user.findUnique({
    where: {
      userId,
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!currentUser) {
    return redirectToSignIn();
  }

  return (
    <div className="mx-auto max-w-screen-md space-y-4 px-4 pt-12 text-zinc-100 lg:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-4xl font-semibold md:text-5xl">Dashboard</p>
        <p className="text-zinc-400 max-md:text-sm">Manage your posts</p>
        <hr className="border-zinc-800" />
      </div>

      <div className="flex gap-4 rounded-md border-2 border-zinc-800 p-2">
        <div className="relative aspect-square overflow-hidden max-md:w-20 md:w-32">
          <Image
            src={currentUser.imageUrl ?? ""}
            alt="user profile picture"
            fill
            className="rounded-md object-cover"
          />
        </div>
        <div className="flex flex-col gap-1.5 ">
          <p className="font-karla text-xl font-semibold tracking-wider md:text-2xl">
            {currentUser.name}
          </p>
          <p className="text-zinc-400">
            Member Since:{" "}
            {dateFormat(new Date(currentUser.createdAt).toISOString())}
          </p>
          <p className="text-zinc-400">Posts: {currentUser._count.posts}</p>
        </div>
      </div>
      <UserPostsSection userId={currentUser.id} />
    </div>
  );
};
export default DashboardPage;
