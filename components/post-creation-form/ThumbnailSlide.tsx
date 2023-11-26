import { TPostCreationForm } from "@/lib/types/form";
import { FC } from "react";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/Form";
import FileUpload from "../FileUpload";

interface ThumbnailSlideProps {
  form: TPostCreationForm;
}

const ThumbnailSlide: FC<ThumbnailSlideProps> = ({ form }) => {
  return (
    <FormField
      name="thumbnail"
      control={form.control}
      render={({ field }) => (
        <FormItem className="mx-auto grid max-w-screen-sm place-items-center gap-8 max-sm:mt-12 md:gap-12">
          <div className="">
            <p className="text-center text-xl md:text-2xl">Add a cover image</p>
            <p className="text-center text-zinc-400">
              Optional but recommended.
            </p>
          </div>
          <FormControl>
            <FileUpload
              classNames="aspect-video max-w-[500px]"
              endPoint="image"
              onChange={field.onChange}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ThumbnailSlide;