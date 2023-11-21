import { useFilters } from "@/hooks/useFilters";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FC } from "react";
import qs from "query-string";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/Form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import MultiSelect from "./MultiSelect";
import Tag from "./Tag";
import { allTags } from "./post-creation-form/TagSelectionSlide";

interface FiltersProps {}

const filterVariants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

const formSchema = z.object({
  keyword: z.string().optional(),
  sortBy: z.string().optional(),
  tags: z.string().array().max(5),
});

const Filters: FC<FiltersProps> = ({}) => {
  const { onClose, isOpen } = useFilters();
  const router = useRouter();

  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: searchParams.get("keyword") || "",
      tags: [],
      sortBy: "latest",
    },
  });

  const tags = form.watch("tags");

  const handleSearch = (values: z.infer<typeof formSchema>) => {
    let currentQuery = {};

    if (searchParams) {
      currentQuery = qs.parse(searchParams.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      keyword: values.keyword || null,
      sortBy: values.sortBy || null,
      tags: values.tags || null,
    };

    const url = qs.stringifyUrl(
      {
        url: "/home",
        query: updatedQuery,
      },
      { skipNull: true },
    );

    router.push(url);
    onClose();
  };

  const onDeleteTag = (tag: string) => {
    form.setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  return (
    <motion.section
      initial={{ height: 0, opacity: 0 }}
      variants={filterVariants}
      animate={isOpen ? "visible" : "hidden"}
      className="mx-auto border-b border-zinc-800 max-w-screen-md px-4 text-zinc-100"
    >
      <div className="flex flex-col gap-4 py-8">
        <p className="text-2xl font-light md:text-3xl">Search</p>
        <hr className="-mt-3 border-zinc-700" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSearch)}
            className="flex flex-col gap-6"
          >
            <FormField
              name="keyword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search by Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Title"
                      className="border-none bg-zinc-800 px-3 py-2 outline-none focus-visible:outline-zinc-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="sortBy"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort By</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-none bg-zinc-800 py-5 text-zinc-100 outline-none">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-sm border-zinc-700 bg-zinc-800 text-zinc-100">
                      <SelectItem
                        className={cn("py-3 hover:bg-zinc-700", {
                          "bg-zinc-900": form.getValues().sortBy === "latest",
                        })}
                        value="latest"
                      >
                        Latest Posts
                      </SelectItem>
                      <SelectItem
                        className={cn("py-2 hover:bg-zinc-700", {
                          "bg-zinc-900": form.getValues().sortBy === "oldest",
                        })}
                        value="oldest"
                      >
                        Oldest Posts
                      </SelectItem>
                      <SelectItem
                        className={cn("py-2 hover:bg-zinc-700", {
                          "bg-zinc-900":
                            form.getValues().sortBy === "most-popular",
                        })}
                        value="most-popular"
                      >
                        Most Popular
                      </SelectItem>
                      <SelectItem
                        className={cn("py-2 hover:bg-zinc-700", {
                          "bg-zinc-900":
                            form.getValues().sortBy === "least-popular",
                        })}
                        value="least-popular"
                      >
                        Least Popular
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="tags"
              control={form.control}
              render={({ field }) => (
                <FormItem className="z-30">
                  <FormLabel>Tags</FormLabel>
                  <MultiSelect
                    onChange={field.onChange}
                    maxSelection={5}
                    options={allTags}
                    selectedOptions={tags}
                  />
                  <FormMessage />
                  {!!tags.length && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      {tags.map((tag, index) => (
                        <Tag
                          key={tag}
                          tag={tag}
                          index={index}
                          onDelete={onDeleteTag}
                        />
                      ))}
                    </div>
                  )}
                  <div className=""></div>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  form.reset();
                  onClose();
                  form.setValue("sortBy", "latest");
                  router.push("/home");
                }}
                type="button"
                className="w-fit bg-zinc-900 hover:bg-zinc-800"
              >
                Reset
                <RefreshCcw className="ml-2 h-4 w-4" />
              </Button>
              <Button className="w-fit bg-rose-500 hover:bg-red-600">
                Search
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.section>
  );
};

export default Filters;
