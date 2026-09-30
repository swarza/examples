"use client";
import {
  ChevronsUpDown,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Newspaper,
  PenLine,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logout } from "../admin/actions";
import { Logo } from "./logo";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";

type Item = { href: string; label: string; icon: typeof Inbox; badge?: number };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export function AppSidebar({
  editor,
  unread,
}: {
  editor: { name: string; email: string; role: "admin" | "editor" };
  unread: number;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [signingOut, signOut] = useTransition();

  const newsroom: Item[] = [
    { href: "/admin", label: "Desk", icon: LayoutDashboard },
    { href: "/admin/posts", label: "Stories", icon: Newspaper },
    { href: "/admin/messages", label: "Inbox", icon: Inbox, badge: unread },
  ];
  const manage: Item[] = [
    { href: "/admin/front-page", label: "Front page", icon: LayoutPanelTop },
    ...(editor.role === "admin"
      ? [
          { href: "/admin/categories", label: "Sections", icon: Tags },
          { href: "/admin/editors", label: "Editors", icon: Users },
        ]
      : []),
  ];

  const active = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : href === "/admin/posts"
        ? pathname.startsWith("/admin/posts") && pathname !== "/admin/posts/new"
        : pathname === href || pathname.startsWith(`${href}/`);

  const renderItem = (item: Item) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        tooltip={item.label}
        isActive={active(item.href)}
        render={<Link href={item.href} onClick={() => isMobile && setOpenMobile(false)} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" />} tooltip="Dispatch newsroom">
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="New story"
                  isActive={pathname === "/admin/posts/new"}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground"
                  render={<Link href="/admin/posts/new" onClick={() => isMobile && setOpenMobile(false)} />}
                >
                  <PenLine />
                  <span>New story</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Newsroom</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{newsroom.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {manage.length ? (
          <SidebarGroup>
            <SidebarGroupLabel>Manage</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{manage.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" tooltip={editor.name} />}>
                <Avatar className="size-8 rounded-lg after:rounded-lg">
                  <AvatarFallback className="rounded-lg">{initials(editor.name)}</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">{editor.name}</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{editor.role}</span>
                </span>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={8}
                className="w-60"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="grid gap-0.5 px-2 py-1.5">
                    <span className="truncate text-sm font-medium text-foreground">{editor.name}</span>
                    <span className="truncate text-xs font-normal">{editor.email}</span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<a href="/" target="_blank" rel="noopener" />}>
                  <ExternalLink /> View the site
                </DropdownMenuItem>
                <DropdownMenuItem disabled={signingOut} onClick={() => signOut(() => logout())}>
                  <LogOut /> {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
