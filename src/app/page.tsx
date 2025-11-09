import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon, Search } from "lucide-react";
import StickyHeader from "~/components/ui/sticky-header";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "~/components/ui/input-group";
import { Separator } from "~/components/ui/separator";
import { TooltipProvider } from "~/components/ui/tooltip";

export default function Home() {
  return (
    <TooltipProvider>
      <ThemeToggle />
      <StickyHeader name="FindMyYota" />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-14 px-6 py-20">
          {/* Title */}
          <h1 className="text-6xl font-extrabold tracking-tight text-foreground sm:text-[6rem]">
            FindMy<span className="text-primary">Yota</span>
          </h1>

          {/* Search Bar */}
          <div className="w-full max-w-4xl">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-6 w-6" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search..."
                className="h-20 text-xl px-6 rounded-xl"
              />
            </InputGroup>
          </div>

          {/* Chatbox */}
          <div className="w-full max-w-4xl">
            <InputGroup>
              <InputGroupTextarea
                placeholder="Ask, Search or Chat..."
                className="min-h-[28rem] text-lg leading-relaxed p-6 rounded-2xl"
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  variant="outline"
                  className="rounded-full text-xl p-4"
               
                >
                  <IconPlus className="h-6 w-6" />
                </InputGroupButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton variant="ghost" className="text-lg">
                      Auto
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="[--radius:0.95rem]"
                  >
                    <DropdownMenuItem>Auto</DropdownMenuItem>
                    <DropdownMenuItem>Agent</DropdownMenuItem>
                    <DropdownMenuItem>Manual</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="!h-5" />
                <InputGroupButton
                  variant="default"
                  className="rounded-full p-4"
       
                >
                  <ArrowUpIcon className="h-6 w-6" />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
