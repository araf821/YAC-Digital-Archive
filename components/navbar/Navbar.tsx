"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFilters } from "@/hooks/useFilters";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import NavLinks from "./NavLinks";
import { useModal } from "@/hooks/useModal";
import { kobata } from "@/app/fonts";
import { useMenu } from "@/hooks/useMenu";
import Image from "next/image";

interface NavbarProps {
  user: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const [prevScrollPos, setPrevScrollPos] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(true);
  const pathname = usePathname();
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useFilters();
  const { onOpen: onOpenModal } = useModal();
  const { onOpen: openMenu } = useMenu();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const currentScrollPos = window.scrollY;

        // The navbar stays visible if the scroll distance from the top is less than 100px
        if (currentScrollPos < 100) {
          setVisible(true);
        } else if (prevScrollPos > currentScrollPos) {
          setVisible(true);
        } else {
          setVisible(false);
        }

        setPrevScrollPos(currentScrollPos);
      }, 50); // debounce delay
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [prevScrollPos]);

  return (
    <nav
      className={cn(
        "z-40 h-20 w-full shadow-[0_4px_20px_black] border-b border-zinc-800 bg-zinc-900 transition duration-300 hover:opacity-100",
        {
          "translate-y-0": visible,
        },
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-4 opacity-100 md:px-8 xl:px-12">
        <Link
          href="/"
          className={`${kobata.className} flex items-center text-xl text-zinc-100 transition duration-200 hover:scale-110 md:text-2xl`}
        >
          Archive Our Youth
        </Link>

        <NavLinks />

        <div className="max-lg:hidden md:items-center md:gap-x-6 lg:flex">
          <button
            className={cn(
              "group relative text-lg font-semibold tracking-widest text-white transition duration-300 hover:text-green-300",
              {
                "text-green-500 hover:text-green-500": pathname === "/submit",
              },
            )}
            onClick={() => {
              if (user) {
                router.push("/submit");
              } else {
                onOpenModal("submitAuthModal");
              }
            }}
          >
            {/* <span className="absolute inset-x-0 top-0 h-[50%] origin-bottom-right scale-0 rounded-t-sm bg-white transition duration-200 group-hover:scale-100" />
            <span className="absolute inset-x-0 bottom-0 h-[50%] origin-top-left scale-0 rounded-b-sm bg-white transition duration-200 group-hover:scale-100" /> */}
            Submit
          </button>
          {user ? (
            <div className="rounded-full border-2 border-zinc-700">
              <UserButton afterSignOutUrl="/home" />
            </div>
          ) : (
            <button
              onClick={() => onOpenModal("authModal")}
              className="relative aspect-square w-8 overflow-hidden rounded-full"
            >
              <span className="sr-only">profile picture</span>
              <Image
                fill
                src="/placeholder-image.png"
                alt="avatar"
                className="object-cover"
                sizes="50px"
              />
            </button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="items-center justify-center gap-3 rounded-md bg-zinc-800 p-2 text-white max-lg:flex lg:hidden">
          {pathname === "/home" && (
            <button
              className={cn("transition", { "text-green-600": isOpen })}
              onClick={() => {
                if (isOpen) onClose();
                else onOpen();
              }}
            >
              <span className="sr-only">search</span>
              <Search className="h-6 w-6 md:h-6 md:w-6" />
            </button>
          )}
          <button onClick={() => openMenu()} className="relative">
            <span className="sr-only">side menu</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 fill-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
