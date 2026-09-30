"use client";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CircleAlert,
  GripVertical,
  RotateCcw,
  Save,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  leadLayouts,
  rowLayouts,
  sidebarPlaces,
  sidebarStyles,
  type FeaturedModule,
  type Module,
  type SectionModule,
  type Tone,
} from "@/lib/front-page";
import { resetFrontPage, saveFrontPage } from "../admin/actions";
import { cn } from "../_lib/utils";
import { FrontPreview } from "./front-preview";
import {
  leadDiagrams,
  rowDiagrams,
  sidebarDiagrams,
  sidebarStyleSwatches,
  toneSwatches,
} from "./layout-diagrams";
import { PageHeader } from "./page-header";
import { SaveBar } from "./save-bar";
import { SelectField } from "./select-field";
import { SubmitButton } from "./submit-button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useSavedLabel } from "./use-saved-label";
import { NOT_SAVED } from "./use-form-action";
import { useUnsavedGuard } from "./use-unsaved-guard";

/** The admin's words for the tone: a module either sits on the page or on a black band. */
const bands: Record<Tone, string> = { plain: "None", black: "Black band" };

const options = <T extends string>(labels: Record<T, string>, icons: Record<T, React.ReactNode>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value], icon: icons[value] }));

const leadOptions = options(leadLayouts, leadDiagrams);
const rowOptions = options(rowLayouts, rowDiagrams);
const sidebarOptions = options(sidebarPlaces, sidebarDiagrams);
const sidebarStyleOptions = options(sidebarStyles, sidebarStyleSwatches);
const bandOptions = options(bands, toneSwatches);

/** Stories in a row of Featured or a section; the same rule as rowSize in lib/content.ts. */
const rowSize = (m: FeaturedModule | SectionModule) =>
  m.kind === "featured" && (m.layout === "equal" || m.layout === "list") ? 4 : 3;

/** One line that says how a block is set up, e.g. "Big story left · Black band". */
function summary(m: Module) {
  const parts =
    m.kind === "lead"
      ? [leadLayouts[m.layout]]
      : m.kind === "latest"
        ? [sidebarPlaces[m.sidebar], ...(m.sidebar === "none" ? [] : [sidebarStyles[m.sidebarStyle]])]
        : [rowLayouts[m.layout]];
  if (m.tone === "black") parts.push("Black band");
  return parts.join(" · ");
}

/** One labelled control in a block's settings. */
function Setting({
  id,
  label,
  note,
  className,
  children,
}: {
  id: string;
  label: string;
  /** A short line under the control, e.g. how many stories the layout shows. */
  note?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Field className={cn("min-w-0 gap-2", className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {note ? <FieldDescription>{note}</FieldDescription> : null}
    </Field>
  );
}

function ModuleRow({
  module: m,
  name,
  index,
  count,
  canEdit,
  onChange,
  onMove,
  onShow,
}: {
  module: Module;
  name: string;
  index: number;
  count: number;
  canEdit: boolean;
  onChange: (next: Module) => void;
  onMove: (from: number, to: number) => void;
  /** Scrolls the preview to this block. */
  onShow: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: m.id, disabled: !canEdit });
  const [open, setOpen] = useState(false);
  const id = (what: string) => `${m.id}-${what}`;

  const moveButtons = (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canEdit || index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label={`Move ${name} up`}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canEdit || index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={`Move ${name} down`}
      >
        <ArrowDown />
      </Button>
    </>
  );
  const toggle = (className: string) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      aria-expanded={open}
      aria-controls={id("settings")}
      aria-label={`Settings for ${name}`}
      onClick={() => setOpen((o) => !o)}
    >
      <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
    </Button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-module={m.id}
      className={cn("relative", isDragging && "z-10")}
      onFocus={() => onShow(m.id)}
    >
      <Card className={cn("gap-4", isDragging && "shadow-lg ring-2 ring-ring/60")}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button
              ref={setActivatorNodeRef}
              type="button"
              variant="ghost"
              size="icon"
              disabled={!canEdit}
              className="-ml-2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
              aria-label={`Drag ${name}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical />
            </Button>
            <div className={cn("min-w-0 flex-1", m.hidden && "opacity-60")}>
              <p className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShow(m.id)}
                  title="Show this block in the preview"
                  className="relative truncate rounded-sm text-left text-base font-medium outline-none after:absolute after:-inset-x-1 after:-inset-y-2 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {name}
                </button>
                {m.hidden ? <Badge variant="outline">Hidden</Badge> : null}
              </p>
              <p className="truncate text-sm text-muted-foreground">{summary(m)}</p>
            </div>
            <div className="hidden items-center sm:flex">{moveButtons}</div>
            <div className="flex items-center gap-2">
              <Label htmlFor={id("visible")} className="text-sm font-normal text-muted-foreground">
                <span className="sr-only">Show {name}</span>
                <span aria-hidden className="max-md:hidden">
                  Visible
                </span>
              </Label>
              <Switch
                id={id("visible")}
                checked={!m.hidden}
                disabled={!canEdit}
                onCheckedChange={(on) => onChange({ ...m, hidden: !on })}
              />
            </div>
            {toggle("hidden sm:inline-flex xl:hidden")}
          </div>

          {/* Phones: the move buttons and the settings toggle get their own line. */}
          <div className="-my-1 flex items-center gap-1 sm:hidden">
            {moveButtons}
            <div className="ml-auto">{toggle("")}</div>
          </div>

          <div
            id={id("settings")}
            className={cn(
              "grid gap-4",
              !open && "max-xl:hidden",
              m.kind === "latest" ? "sm:grid-cols-3 xl:grid-cols-2" : "sm:grid-cols-[minmax(0,1fr)_10rem]",
            )}
          >
            {m.kind === "lead" ? (
              <Setting id={id("layout")} label="Layout">
                <SelectField
                  id={id("layout")}
                  value={m.layout}
                  disabled={!canEdit}
                  items={leadOptions}
                  onValueChange={(v) => onChange({ ...m, layout: v as typeof m.layout })}
                />
              </Setting>
            ) : m.kind === "latest" ? (
              <>
                <Setting id={id("sidebar")} label="Sidebar" className="xl:col-span-2">
                  <SelectField
                    id={id("sidebar")}
                    value={m.sidebar}
                    disabled={!canEdit}
                    items={sidebarOptions}
                    onValueChange={(v) => onChange({ ...m, sidebar: v as typeof m.sidebar })}
                  />
                </Setting>
                <Setting id={id("sidebar-style")} label="Sidebar style">
                  <SelectField
                    id={id("sidebar-style")}
                    value={m.sidebarStyle}
                    disabled={!canEdit || m.sidebar === "none"}
                    items={sidebarStyleOptions}
                    onValueChange={(v) => onChange({ ...m, sidebarStyle: v as typeof m.sidebarStyle })}
                  />
                </Setting>
              </>
            ) : (
              <Setting
                id={id("layout")}
                label="Layout"
                note={m.kind === "featured" ? `Shows ${rowSize(m)} stories` : undefined}
              >
                <SelectField
                  id={id("layout")}
                  value={m.layout}
                  disabled={!canEdit}
                  items={rowOptions}
                  onValueChange={(v) => onChange({ ...m, layout: v as typeof m.layout })}
                />
              </Setting>
            )}
            <Setting id={id("tone")} label="Band">
              <SelectField
                id={id("tone")}
                value={m.tone}
                disabled={!canEdit}
                items={bandOptions}
                onValueChange={(v) => onChange({ ...m, tone: v as typeof m.tone })}
              />
            </Setting>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

/**
 * The front page's arrangement: an ordered list of modules, each with its layout, background and
 * visibility, and a live preview of the unsaved arrangement. Only admins save; editors look.
 */
export function FrontPageEditor({
  initial,
  names,
  canEdit,
  savedAt,
  customised,
}: {
  initial: Module[];
  names: Record<string, string>;
  canEdit: boolean;
  savedAt: number | undefined;
  customised: boolean;
}) {
  const router = useRouter();
  const [modules, setModules] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [lastSave, setLastSave] = useState(savedAt);
  const [pending, start] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  /** The block last changed, focused or clicked: the preview scrolls to it. */
  const [target, setTargetState] = useState<{ id: string; seq: number } | null>(null);
  const setTarget = (id: string) => setTargetState((t) => ({ id, seq: (t?.seq ?? 0) + 1 }));
  const json = useMemo(() => JSON.stringify(modules), [modules]);
  const dirty = json !== saved;
  const savedLabel = useSavedLabel(lastSave);
  const { dialog } = useUnsavedGuard({ dirty, pending, what: "the front page" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= modules.length) return;
    setModules((list) => arrayMove(list, from, to));
    // Keep focus on the same button after the row moves.
    const button = from > to ? "up" : "down";
    const moved = modules[from]!;
    setTarget(moved.id);
    requestAnimationFrame(() => {
      const row = document.querySelector<HTMLElement>(`[data-module="${moved.id}"]`);
      const visible = [
        ...(row?.querySelectorAll<HTMLButtonElement>('button[aria-label^="Move"]') ?? []),
      ].filter((b) => b.offsetParent !== null && !b.disabled);
      (visible.find((b) => b.getAttribute("aria-label")?.endsWith(button)) ?? visible[0])?.focus();
    });
  };
  const update = (next: Module) => {
    setTarget(next.id);
    setModules((list) => list.map((m) => (m.id === next.id ? next : m)));
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = modules.findIndex((m) => m.id === active.id);
    const to = modules.findIndex((m) => m.id === over.id);
    setTarget(String(active.id));
    setModules((list) => arrayMove(list, from, to));
  };
  const nameOf = (id: string | number) => names[String(id)] ?? "Module";
  const position = (id: string | number) => modules.findIndex((m) => m.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}, position ${position(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over position ${position(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} dropped at position ${position(over.id)}.` : undefined,
    onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} was cancelled.`,
  };

  const save = () =>
    start(async () => {
      const result = await saveFrontPage(json).catch(() => ({ error: NOT_SAVED, ok: undefined }));
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setSaved(json);
      setLastSave(Date.now());
      if (result?.ok) toast.success(result.ok);
      router.refresh();
    });

  const reset = () =>
    start(async () => {
      const result = await resetFrontPage().catch(() => ({ error: NOT_SAVED, ok: undefined }));
      setResetOpen(false);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.ok) toast.success(result.ok);
      router.refresh();
    });

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (!pending && dirty) save();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Front page"
        description="The order of the front page's blocks, how each is laid out, and whether it shows. The preview follows your changes before you save."
        actions={
          canEdit ? (
            <AlertDialog open={resetOpen} onOpenChange={(open) => (pending ? undefined : setResetOpen(open))}>
              <AlertDialogTrigger
                render={<Button type="button" variant="outline" disabled={!customised && !dirty} />}
              >
                <RotateCcw /> Reset to default
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset the front page?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The saved arrangement is removed and the front page goes back to the default order and
                    layouts, on the site too. Unsaved changes here are lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                  <SubmitButton
                    type="button"
                    variant="destructive"
                    pending={pending}
                    pendingLabel="Resetting"
                    onClick={reset}
                  >
                    Reset to default
                  </SubmitButton>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null
        }
      />

      {canEdit ? null : (
        <Alert>
          <CircleAlert />
          <AlertTitle>Only admins can change the front page</AlertTitle>
          <AlertDescription>You can look at the arrangement and its preview.</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        <section aria-labelledby="modules-title" className="flex min-w-0 flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="modules-title" className="text-base font-medium">
              Blocks, top to bottom
            </h2>
            <p className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {modules.filter((m) => !m.hidden).length} of {modules.length} visible
              </span>
              <a
                href="#preview"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-mr-2 xl:hidden")}
              >
                Go to preview
              </a>
            </p>
          </div>
          <p className="-mt-1 text-sm text-muted-foreground">
            Click a block&apos;s name to find it in the preview. Band: a black band runs the full page width.
          </p>
          <DndContext
            id="front-page-blocks"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={{
              announcements,
              screenReaderInstructions: {
                draggable:
                  "To move a block, press space or enter, use the arrow keys, then press space or enter again. Escape cancels.",
              },
            }}
          >
            <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <ol className="flex flex-col gap-2" aria-label="Front page blocks">
                {modules.map((m, i) => (
                  <ModuleRow
                    key={m.id}
                    module={m}
                    name={names[m.id] ?? "Module"}
                    index={i}
                    count={modules.length}
                    canEdit={canEdit}
                    onChange={update}
                    onMove={move}
                    onShow={setTarget}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </section>

        <FrontPreview modules={modules} target={target} />
      </div>

      {canEdit ? (
        <SaveBar
          dirty={dirty}
          savedLabel={customised || lastSave !== savedAt ? savedLabel : "Default arrangement"}
        >
          {dirty ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModules(JSON.parse(saved))}
              disabled={pending}
            >
              <Undo2 /> <span className="max-sm:sr-only">Undo changes</span>
            </Button>
          ) : null}
          <SubmitButton
            type="button"
            pending={pending && !resetOpen}
            pendingLabel="Saving"
            disabled={!dirty || pending}
            onClick={save}
            title="Save (Ctrl+S or ⌘S)"
            aria-keyshortcuts="Control+S Meta+S"
          >
            <Save /> Save front page
          </SubmitButton>
        </SaveBar>
      ) : null}
      {dialog}
    </div>
  );
}
