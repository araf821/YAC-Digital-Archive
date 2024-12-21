import { FC } from "react";
import DynamicImage from "../../DynamicImage";
import PDFViewer from "../../PDFViewer";
import Link from "next/link";

interface PostMediaProps {
  contentType: string;
  postContent: string;
}

const PostMedia: FC<PostMediaProps> = ({ contentType, postContent }) => {
  if (contentType === "IMAGE") {
    return <DynamicImage src={postContent} />;
  }

  if (contentType === "VIDEO") {
    return (
      <div className="relative aspect-video w-full overflow-hidden border border-zinc-800">
        <video src={postContent} className="h-full w-full" controls />
      </div>
    );
  }

  if (contentType === "AUDIO") {
    return (
      <div className="relative my-4 w-full overflow-hidden">
        <audio src={postContent} controls className="w-full py-0.5" />
      </div>
    );
  }

  if (contentType === "PDF") {
    return (
      <div className="space-y-2">
        <Link
          href={postContent}
          target="_blank"
          className="group relative w-fit text-zinc-400 transition hover:text-zinc-100"
        >
          View Externally
          <span className="absolute bottom-0 left-0 h-[1px] w-full origin-bottom-left scale-x-0 bg-zinc-400 transition group-hover:scale-x-100 group-hover:bg-zinc-100" />
        </Link>
        <PDFViewer url={postContent} />
      </div>
    );
  }

  return null;
};

export default PostMedia;