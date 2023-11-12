"use client";

import { FormEvent, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import axios from "axios";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Form } from "../ui/Form";
import { Button } from "../ui/Button";
import { ScrollArea } from "../ui/ScrollArea";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContentType } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { PostCreationValidator } from "@/lib/validators/post";

// Slides
import ResearchQuestions from "./ResearchQuestions";
import TypeSelectionSlide from "./TypeSelectionSlide";
import TitleSlide from "./TitleSlide";
import ContentSlide from "./ContentSlide";
import DescriptionSlide from "./DescriptionSlide";
import TagSelectionSlide from "./TagSelectionSlide";
import Tag from "../Tag";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";

enum STEPS {
  WELCOME = 0,
  QUESTIONS = 1,
  TYPE = 2,
  TITLE = 3,
  CONTENT = 4,
  DESCRIPTION = 5,
  TAGS = 6,
  CONFIRM = 7,
}

const PostCreationForm = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(STEPS.WELCOME);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const form = useForm<z.infer<typeof PostCreationValidator>>({
    resolver: zodResolver(PostCreationValidator),
    defaultValues: {
      title: "",
      contentType: "TEXT",
      content: "",
      description: "",
      tags: [],
      researchQuestions: [],
    },
  });

  const isLoading = form.formState.isSubmitting;
  const contentType = form.watch("contentType");
  const tags = form.watch("tags");

  const onNext = () => {
    setStep((currentStep) => {
      if (contentType === "TEXT" && step === STEPS.CONTENT) {
        return currentStep + 2;
      }
      return currentStep + 1;
    });
  };

  const onBack = () => {
    setStep((currentStep) => {
      if (contentType === "TEXT" && step === STEPS.TAGS) {
        return currentStep - 2;
      }
      return currentStep - 1;
    });
  };

  const handleTypeChange = useCallback(
    (type: ContentType) => {
      if (type === form.getValues().contentType) {
        return;
      }
      form.setValue("contentType", type);
      form.setValue("content", "");
    },
    [form],
  );

  const onSubmit = async (values: z.infer<typeof PostCreationValidator>) => {
    if (!consentChecked) {
      return toast.error("You must agree to the terms and conditions.");
    }

    try {
      await axios.post("/api/post", values);
      toast.success("Your post has been published!");
      form.reset();
      router.push("/home");
    } catch (error: any) {
      toast.error("Something went wrong.");
      console.log(error);
    }
  };

  let introScreen, confirmationScreen;

  introScreen = (
    <div
      className={`flex max-w-screen-lg flex-col items-center justify-center gap-12 text-center ${
        step > 1 && "hidden"
      }`}
    >
      <p className="flex flex-col gap-2 font-karla text-6xl font-bold text-zinc-100 md:text-7xl lg:text-8xl xl:text-9xl">
        Digital<span>Archive</span>
      </p>
      <p className="text-xl font-semibold text-zinc-300 md:text-2xl">
        Submission Portal
      </p>
      <Button
        onClick={onNext}
        type="button"
        size="lg"
        className="flex gap-x-2 bg-zinc-200 text-zinc-800 transition hover:translate-x-2 hover:bg-white"
      >
        Get Started
        <ArrowRight />
      </Button>
    </div>
  );

  confirmationScreen = (
    <ScrollArea className="mx-auto flex max-w-screen-sm flex-col justify-center space-y-4 overflow-y-auto">
      <div className="pb-4">
        <p className="text-xl text-zinc-300 md:text-2xl">Review Submission</p>
        {userId ? null : (
          <p className="text-left text-zinc-300 max-md:text-sm md:text-base">
            Posting <span className="font-bold text-rose-500">anonymously</span>
            , you will not be able to delete your post later without contacting
            us.
          </p>
        )}
        <hr className="mt-1.5 w-full border-zinc-700" />
      </div>
      <div className="divide-y-2 divide-zinc-700 rounded-md border border-zinc-700 px-4">
        <div className="pb-3 pt-5 capitalize">
          <p className="pb-2">Post Type</p>
          <span className="font-bold">{contentType.toLowerCase()}</span>
        </div>
        <div className="py-4 capitalize">
          <p
            className={cn("pb-2", {
              "text-rose-600": form.formState.errors.title,
            })}
          >
            Title
          </p>
          <span className="font-bold">
            {form.getValues().title || (
              <p className="font-normal normal-case text-zinc-400">
                Title is missing,{" "}
                <button
                  onClick={() => setStep(STEPS.TITLE)}
                  className="text-left normal-case text-blue-400"
                >
                  click here to navigate to the title screen.
                </button>
              </p>
            )}
          </span>
        </div>
        <div className="py-4">
          {contentType === "TEXT" && (
            <>
              <p
                className={cn("pb-2", {
                  "text-rose-600": form.formState.errors.content,
                })}
              >
                Content
              </p>
              {form.getValues().content ? (
                <ReactMarkdown className="prose-headings:font-josefin prose prose-xl h-full max-w-full overflow-y-auto break-words rounded-md bg-zinc-800 p-2.5 text-start text-zinc-100 prose-headings:font-semibold prose-headings:text-zinc-50 prose-h1:m-0 prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-code:whitespace-pre-wrap prose-img:rounded-md">
                  {form.getValues().content || ""}
                </ReactMarkdown>
              ) : (
                <p className="text-zinc-400">
                  No text to preview,{" "}
                  <button
                    onClick={() => setStep(3)}
                    type="button"
                    className="text-left text-blue-400"
                  >
                    click here to get back to the content screen.
                  </button>
                </p>
              )}
            </>
          )}
          {contentType !== "TEXT" && !form.getValues().content ? (
            <p className="text-zinc-400">
              <span className="capitalize">{contentType.toLowerCase()}</span>{" "}
              not added yet,{" "}
              <button
                type="button"
                onClick={() => setStep(STEPS.CONTENT)}
                className="text-left text-blue-400"
              >
                click here to go to the upload screen.
              </button>
            </p>
          ) : (
            <>
              {contentType === "IMAGE" && (
                <div className="relative aspect-video w-full">
                  <Image
                    fill
                    src={form.getValues().content}
                    className="object-contain"
                    alt="post image"
                  />
                </div>
              )}
              {contentType === "VIDEO" && (
                <div className="relative aspect-video ">
                  <p className="pb-4">Uploaded Content</p>
                  <video
                    src={form.getValues().content}
                    className="object-cover"
                    controls
                  />
                </div>
              )}
              {contentType === "AUDIO" && (
                <div className="w-full">
                  <p className="pb-4">Uploaded Content</p>
                  <audio
                    src={form.getValues().content}
                    controls
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}
        </div>
        {contentType !== "TEXT" && (
          <div className="py-4">
            <p
              className={cn("pb-2", {
                "text-rose-600": form.formState.errors.description,
              })}
            >
              Description (optional)
            </p>
            {form.getValues().description ? (
              <ReactMarkdown className="prose-headings:font-josefin prose prose-xl h-full max-w-full overflow-y-auto break-words rounded-md bg-zinc-800 p-2.5 text-start text-zinc-100 prose-headings:font-semibold prose-headings:text-zinc-50 prose-h1:m-0 prose-a:text-blue-600 prose-a:hover:text-blue-700 prose-code:whitespace-pre-wrap prose-img:rounded-md">
                {form.getValues().description || ""}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-400">Description was not added</p>
            )}
          </div>
        )}
        <div className="py-4">
          <p
            className={cn("pb-2", {
              "text-rose-600":
                (tags.length < 1 || tags.length > 8) &&
                form.formState.errors.tags,
            })}
          >
            Tag
          </p>
          {form.getValues().tags.length < 1 && (
            <p className="text-zinc-400">
              At least one tag is required,{" "}
              <button
                type="button"
                onClick={() => setStep(STEPS.TAGS)}
                className="text-left text-blue-400"
              >
                click here to navigate to the tags screen.
              </button>
            </p>
          )}
          <ul className="flex flex-wrap gap-2 pt-2">
            {form.getValues().tags.map((tag, index) => (
              <Tag key={tag} index={index} tag={tag} />
            ))}
          </ul>
        </div>
        <div className="py-8">
          <div className="flex gap-2">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={() => {
                setConsentChecked((prev) => !prev);
              }}
              className="h-5 w-5 border border-zinc-500 bg-zinc-700 checked:bg-zinc-500 data-[state=checked]:bg-rose-600"
            />
            <label
              htmlFor="consent"
              className="space-y-3 font-bold text-zinc-400 max-md:text-sm"
            >
              <p>
                {" "}
                Click this box if you agree that your submission can be used for
                research purposes. The Archive will contribute to a better
                understanding of youth and planetary well-being and will be used
                to develop future presentations, teaching and/or publications
                such as social media posts, journal articles, and books.
              </p>

              <p>All intellectual and creative rights remain yours.</p>

              <p>
                You have the right to stop participating and delete your
                submission at any time by signing in and deleting it directly,
                or by emailing Deborah MacDonald at the Young Lives Research Lab
                at York University at: dmacd@yorku.ca.
              </p>

              <p>
                You have the right to submit anonymously. If you submit
                anonymously, you can only delete your post by emailing the
                contact above.
              </p>

              <p>
                Please read the full{" "}
                <Link
                  href="https://docs.google.com/document/d/185IyM9Cic-vpMK7yqYLXR0s-YfJrhaSY/edit"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  consent form here.
                </Link>
              </p>
            </label>
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <div className="max-h-[80dvh] w-full max-w-screen-md px-4 lg:px-8">
      <Form {...form}>
        <form className="mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
          {step === STEPS.WELCOME && introScreen}
          {step === STEPS.QUESTIONS && <ResearchQuestions form={form} />}
          {step === STEPS.TYPE && (
            <TypeSelectionSlide
              form={form}
              handleTypeChange={handleTypeChange}
            />
          )}
          {step === STEPS.TITLE && <TitleSlide form={form} />}
          {step === STEPS.CONTENT && <ContentSlide form={form} />}
          {step === STEPS.DESCRIPTION && contentType !== "TEXT" && (
            <DescriptionSlide form={form} />
          )}
          {step === STEPS.TAGS && <TagSelectionSlide form={form} />}
          {step === STEPS.CONFIRM && confirmationScreen}
        </form>
      </Form>
      {step > 0 && (
        <div
          className={cn(
            "mx-auto mt-12 flex w-32 items-center justify-between pb-12",
            {
              "w-full max-w-[350px]": step === STEPS.CONFIRM,
            },
          )}
        >
          <Button
            type="button"
            onClick={onBack}
            variant="link"
            className="px-0 text-zinc-400 hover:scale-105 hover:text-zinc-200"
          >
            <ArrowLeft />
          </Button>
          {step === STEPS.CONFIRM ? (
            <button
              disabled={
                isLoading ||
                !!form.formState.errors.content ||
                !!form.formState.errors.contentType ||
                !!form.formState.errors.title ||
                !!form.formState.errors.description
              }
              className="rounded-md bg-zinc-800 px-3 py-2 transition hover:bg-zinc-700 disabled:opacity-70 disabled:hover:bg-zinc-800"
              onClick={form.handleSubmit(onSubmit)}
            >
              {!!form.formState.errors.content ||
              !!form.formState.errors.contentType ||
              !!form.formState.errors.title ||
              !!form.formState.errors.description
                ? "Form Incomplete"
                : "Submit Post"}
            </button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              variant="link"
              className="px-0 text-zinc-400 hover:scale-105 hover:text-zinc-200"
            >
              <ArrowRight />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCreationForm;