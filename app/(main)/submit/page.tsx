import PostCreationForm from "@/components/post-creation-form/PostCreationForm";
import { initializeUser } from "@/lib/initializeUser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Portal | Archive Our Youth",
  description:
    "Submit your work to have displayed inside of an archive viewed by thousands of people!",
};

const SubmitPage = async () => {
  await initializeUser();

  return (
    <div className="flex min-h-[calc(100dvh-80px)] py-8 items-center justify-center text-white">
      <PostCreationForm />
    </div>
  );
};
export default SubmitPage;
