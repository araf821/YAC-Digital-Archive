"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import axios from "axios";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Form } from "../ui/Form";
import { Button } from "../ui/Button";
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
import { kobata } from "@/app/fonts";
import { AnimatePresence, motion } from "framer-motion";
import ThumbnailSlide from "./ThumbnailSlide";

enum STEPS {
  WELCOME = 0,
  QUESTIONS = 1,
  TYPE = 2,
  TITLE = 3,
  CONTENT = 4,
  THUMBNAIL = 5,
  DESCRIPTION = 6,
  TAGS = 7,
  CONFIRM = 8,
}

const PostCreationForm = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [{ checked, error }, setConsentChecked] = useState({
    checked: false,
    error: false,
  });

  const form = useForm<z.infer<typeof PostCreationValidator>>({
    resolver: zodResolver(PostCreationValidator),
    defaultValues: {
      title: "",
      contentType: "TEXT",
      content: "",
      thumbnail: "",
      description: "",
      tags: [],
      researchQuestions: [],
      location: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const contentType = form.watch("contentType");
  const tags = form.watch("tags");

  const onNext = () => {
    setStep((currentStep) => {
      if (contentType === "TEXT" && currentStep === STEPS.THUMBNAIL) {
        return currentStep + 2;
      }
      if (contentType === "IMAGE" && currentStep == STEPS.CONTENT) {
        return currentStep + 2;
      }
      return Math.min(currentStep + 1, 8);
    });
  };

  const onBack = () => {
    setStep((currentStep) => {
      if (contentType === "TEXT" && currentStep === STEPS.TAGS) {
        return currentStep - 2;
      }
      if (contentType === "IMAGE" && currentStep == STEPS.DESCRIPTION) {
        return currentStep - 2;
      }
      return Math.max(currentStep - 1, 0);
    });
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      // If an input is focused, don't change steps
      if (isInputFocused) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onBack();
          break;
        case " ":
          onNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [contentType]);

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
    if (!checked) {
      setConsentChecked((prev) => ({
        ...prev,
        error: true,
      }));
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
      <p
        className={`${kobata.className} text-[4rem] font-semibold text-zinc-100 md:text-[5rem]`}
      >
        Archive Our Youth
      </p>
      <p className="text-xl font-semibold text-zinc-300 md:text-2xl">
        Submission Portal
      </p>
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={onNext}
          type="button"
          size="lg"
          className="flex gap-x-2 bg-zinc-200 text-zinc-800 transition hover:translate-x-2 hover:bg-white"
        >
          Get Started
          <ArrowRight />
        </Button>
        <p className="text-zinc-400 max-md:hidden">
          You can also use arrow keys or spacebar to navigate.
        </p>
      </div>
    </div>
  );

  confirmationScreen = (
    <div className="mx-auto flex max-w-screen-sm flex-col justify-center space-y-4 pb-8">
      <div className="">
        <p className="text-xl text-zinc-100 md:text-2xl">Review Submission</p>
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
        <div className="py-4">
          <p>
            Research Questions <span className="text-zinc-400">(optional)</span>
          </p>
          {form.getValues().researchQuestions.length < 1 ? (
            <p className="mt-2 text-zinc-400">
              None selected,{" "}
              <button
                onClick={() => setStep(STEPS.QUESTIONS)}
                className="text-left normal-case text-blue-400"
              >
                click here to navigate back.
              </button>
            </p>
          ) : (
            <ul className="mt-2 space-y-2 font-semibold">
              {form.getValues().researchQuestions.map((q) => (
                <li className="ml-6 list-disc" key={q}>
                  {q}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="py-4 capitalize">
          <p className="pb-2">Post Type</p>
          <span className="font-bold">{contentType.toLowerCase()}</span>
        </div>
        <div className="py-4 capitalize">
          <p
            className={cn("pb-2", {
              "text-red-500": !!form.formState.errors.title,
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
                  "text-red-500": form.formState.errors.content,
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
            <>
              <p
                className={cn("", {
                  "text-red-500": form.formState.errors.content,
                })}
              >
                Uploaded Content
              </p>
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
            </>
          ) : (
            <>
              {contentType === "IMAGE" && (
                <div className="relative aspect-video w-full">
                  <p className="pb-4">Uploaded Content</p>
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
              {contentType === "PDF" && (
                <div className="w-full">
                  <p className="pb-4">PDF</p>
                  <Link
                    href={form.getValues().content}
                    target="_blank"
                    className="group relative font-semibold text-blue-600 transition hover:text-blue-500"
                  >
                    Click to view
                    <span className="absolute bottom-0 left-0 h-[1px] w-full origin-bottom-left scale-x-0 bg-blue-600 transition group-hover:scale-x-100 group-hover:bg-blue-500" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        {contentType !== "IMAGE" && (
          <div className="space-y-2 py-4">
            <p>
              Thumbnail <span className="text-zinc-400">(optional)</span>
            </p>
            {form.getValues("thumbnail") ? (
              <div className="relative aspect-video w-full">
                <Image
                  fill
                  src={form.getValues().thumbnail || "/failed-to-load.webp"}
                  className="object-contain"
                  alt="post image"
                />
              </div>
            ) : (
              <p className="text-zinc-400">
                Thumbnail was not added,{" "}
                <button
                  type="button"
                  onClick={() => setStep(STEPS.THUMBNAIL)}
                  className="text-left text-blue-400"
                >
                  click here to go to the upload screen.
                </button>
              </p>
            )}
          </div>
        )}
        {contentType !== "TEXT" && (
          <div className="py-4">
            <p
              className={cn("pb-2", {
                "text-red-500": form.formState.errors.description,
              })}
            >
              Description <span className="text-zinc-400">(optional)</span>
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
              "text-red-500":
                (tags.length < 1 || tags.length > 8) &&
                form.formState.errors.tags,
            })}
          >
            Tags
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
        <AnimatePresence>
          <motion.div className="py-6">
            {error ? (
              <motion.p
                initial={{ height: 0 }}
                exit={{ height: "auto" }}
                animate={{
                  height: "auto",
                }}
                className="text-red-500"
              >
                {error
                  ? "Your consent is required for us to approve your submission."
                  : ""}
              </motion.p>
            ) : null}
            <div className="flex gap-2">
              <Checkbox
                id="consent"
                checked={checked}
                onCheckedChange={() => {
                  setConsentChecked((prev) => ({
                    checked: !prev.checked,
                    error: prev.checked ? true : false,
                  }));
                }}
                className="h-5 w-5 translate-y-1 border border-zinc-500 bg-zinc-700 checked:bg-zinc-600 data-[state=checked]:bg-green-600"
              />
              <label
                htmlFor="consent"
                className="space-y-3 text-zinc-100 max-md:text-sm"
              >
                <p>
                  Click this box if you agree that your submission can be used
                  for research purposes. The Archive will contribute to a better
                  understanding of youth and planetary well-being and will be
                  used to develop future presentations, teaching and/or
                  publications such as social media posts, journal articles, and
                  books.
                </p>

                <p>All intellectual and creative rights remain yours.</p>

                <p>
                  You have the right to stop participating and delete your
                  submission at any time by signing in and deleting it directly,
                  or by emailing Deborah MacDonald at the Young Lives Research
                  Lab at York University at:{" "}
                  <a
                    className="text-blue-400 underline"
                    href="mailto:dmacd@yorku.ca"
                  >
                    dmacd@yorku.ca
                  </a>
                  .
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
                    className="text-blue-400 underline"
                  >
                    consent form here.
                  </Link>
                </p>
              </label>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="max-h-[80dvh] w-full max-w-screen-md px-6 lg:px-10">
      <Form {...form}>
        <form className="mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
          {step === STEPS.WELCOME && introScreen}
          {step === STEPS.QUESTIONS && <ResearchQuestions form={form} />}
          {step === STEPS.TYPE && (
            <TypeSelectionSlide
              form={form}
              nextStep={onNext}
              handleTypeChange={handleTypeChange}
            />
          )}
          {step === STEPS.TITLE && <TitleSlide form={form} />}
          {step === STEPS.CONTENT && <ContentSlide form={form} />}
          {step === STEPS.THUMBNAIL && <ThumbnailSlide form={form} />}
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
