"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { isPasswordPwned, isPasswordStrong } from "@/lib/passwordUtils"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export const schema = z.object({
  id: z.string(),
  firstname: z.string(),
  lastname: z.string(),
  role: z.string(),
  email: z.string(),
  created_at: z.string().nullable(),
})

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "id",
    header: "Account #",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "firstname",
    header: "Firstname",
    enableHiding: true,
  },
  {
    accessorKey: "lastname",
    header: "Lastname",
    enableHiding: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableHiding: true,
  },
  {
    accessorKey: "role",
    header: "Type",
    enableHiding: true,
    cell: ({ row }) => {
      const isAssigned = row.original.role !== "Assign Role"

      if (isAssigned) {
        return row.original.role
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-role`} className="sr-only">
            Account Type
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-role`}
            >
              <SelectValue placeholder="Assign role" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="student">
                Student
              </SelectItem>
              <SelectItem value="student">
                Admin
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      )
    },
  },
  {
  accessorKey: "created_at",
  header: "Created At",
  enableHiding: true,
  cell: ({ row }) => {
    const rawDate = row.original.created_at
    if (!rawDate) return "N/A"

    const date = new Date(rawDate)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },
},
{
  id: "actions",
  cell: ({ row }) => {
    const [open, setOpen] = React.useState(false)
    const [firstname, setFirstname] = React.useState(row.original.firstname || "")
    const [lastname, setLastname] = React.useState(row.original.lastname || "")
    const [role, setRole] = React.useState(row.original.role || "")
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter() 

    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()

        // ✅ Update users table directly
        const { error: updateError } = await supabase
          .from("users")
          .update({
            firstname,
            lastname,
            role,
          })
          .eq("id", row.original.id) // filter by row ID

        if (updateError) throw updateError

        // Success ✅
        router.refresh()
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user")
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setOpen(true)
              }}
            >
              <span>Edit</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className="text-red-600"
              onSelect={() => {
                console.log("Delete row with ID:", row.original.id)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Update the account details below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdate} className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="firstname">Firstname</Label>
                <Input
                  id="firstname"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="lastname">Lastname</Label>
                <Input
                  id="lastname"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Account type</SelectLabel>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="adins">Administrator/Instructor</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">
                  {error}
                </p>
              )}

              <DialogFooter className="flex justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    )
  },
}



]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {/* {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))} */}
      {row.getVisibleCells().map((cell, index) => (
        <TableCell
          key={cell.id}
          className={index === 0 ? "sticky left-0 z-10 bg-background" : ""}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}

    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const [roleFilter, setRoleFilter] = React.useState<string>("all")

  const table = useReactTable({
  data,
  columns,
  state: {
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
    pagination,
  },
  getRowId: (row) => row.id.toString(),
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})

    React.useEffect(() => {
      if (roleFilter === "all") {
        table.setColumnFilters([])
      } else {
        table.setColumnFilters([
          {
            id: "role",
            value: roleFilter,
          },
        ])
      }
    }, [roleFilter])


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [repeatPassword, setRepeatPassword] = React.useState("");
  
    const [firstname, setFirstname] = React.useState("");
    const [lastname, setLastname] = React.useState("");
    const [role, setRole] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = React.useState(false);
    const [passwordStrength, setPasswordStrength] = React.useState<string | null>(null);
    const [isBreached, setIsBreached] = React.useState(false);
    const router = useRouter();

    const handleClose = () => {
      setFirstname("")
      setLastname("")
      setPassword("")
      setRepeatPassword("")
      setRole("")
      setError(null)
    }
  
    const handleSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
      const supabase = createClient();
      setIsLoading(true);
      setError(null);
  
      if (!role) {
        setError("Please select a role before signing up.");
        setIsLoading(false);
        return;
      }
  
      if (password !== repeatPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
  
      const strengthError = isPasswordStrong(password);
      if (strengthError) {
        setError(strengthError);
        setIsLoading(false);
        return;
      }
  
      const isPwned = await isPasswordPwned(password);
      if (isPwned) {
        setError("This password has appeared in data breaches. Please use another one.");
        setIsLoading(false);
        return;
      }
  
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/protected`,
            data: { firstname, lastname, role },
          },
        });
  
        if (error) throw error;
  
        if (data.user) {
          const { data: existingUser, error: selectError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();
  
          if (existingUser) {
            setError("Account already exists.");
            setEmail("");
            setPassword("");
            setRepeatPassword("");
            await supabase.auth.admin.deleteUser(data.user.id);
            return;
          }
  
          if (selectError && selectError.code !== "PGRST116") {
            console.error("Error checking user existence:", selectError);
            setError("Something went wrong checking existing users.");
            return;
          }
  
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              firstname,
              lastname,
              role,
              email,
            },
          ]);
  
          if (insertError) {
            console.error("Insert into users table failed:", insertError);
            setError("Account created but profile insert failed: " + insertError.message);
            return;
          }
  
          router.push("/auth/sign-up-success");
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };


  return (

    <Tabs
      defaultValue="instructor"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
          <SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="adins">Admin/Instructor</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="student">
            Student
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Admin
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Filter Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size={"sm"}>
                    <IconPlus />
                    Administrator
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Administrator Account</DialogTitle>
                    <DialogDescription>Create and Register</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstname">First Name</Label>
                        <Input
                          id="firstname"
                          type="text"
                          placeholder="Sarah"
                          required
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="lastname">Last Name</Label>
                        <Input
                          id="lastname"
                          type="text"
                          placeholder="Discaya"
                          required
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={role} onValueChange={(value) => setRole(value)} required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Account type</SelectLabel>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="adins">Administrator/Instructor</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a password"
                          required
                          value={password}
                          onChange={async (e) => {
                            const value = e.target.value;
                            setPassword(value);

                            const strengthError = isPasswordStrong(value);
                            setPasswordStrength(strengthError ? strengthError : "Strong password");

                            if (value.length > 6) {
                              const pwned = await isPasswordPwned(value);
                              setIsBreached(pwned);
                            } else {
                              setIsBreached(false);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      {password && (
                        <div className="mt-2 text-sm">
                          <div
                            className={`h-2 rounded-full ${
                              isBreached
                                ? "bg-red-500"
                                : passwordStrength === "Strong password"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <p
                            className={`mt-1 ${
                              isBreached
                                ? "text-red-600"
                                : passwordStrength === "Strong password"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {isBreached
                              ? "This password has appeared in data breaches."
                              : passwordStrength}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="repeat-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="repeat-password"
                          type={showRepeatPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          required
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-2">
                        {error}
                      </p>
                    )}

                    <DialogFooter className="flex justify-between">
                      <DialogClose asChild>
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Register"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
        </div>
      </div>
      <TabsContent
        value="instructor"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        // <TableHead key={header.id} colSpan={header.colSpan}>
                        //   {header.isPlaceholder
                        //     ? null
                        //     : flexRender(
                        //         header.column.columnDef.header,
                        //         header.getContext()
                        //       )}
                        // </TableHead>
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={header.index === 0 ? "sticky left-0 z-1000 bg-muted" : ""}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.lastname} {item.firstname}</DrawerTitle>
          <DrawerDescription>
            Showing Account Info
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  GoogleMeet Attendance{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Student log and activeness on online class meetings.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">FirstName</Label>
              <Input id="header" defaultValue={item.firstname} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">LastName</Label>
              <Input id="header" defaultValue={item.lastname} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Account Type</Label>
              <Select defaultValue={item.role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
