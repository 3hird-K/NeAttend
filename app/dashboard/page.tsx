"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

import data from "./data.json"

function PageContent() {
  const { open, toggleSidebar, isMobile } = useSidebar()

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          isMobile
            ? `fixed top-0 left-0 z-50 h-screen w-80 bg-background shadow-lg ${
                open ? "translate-x-0" : "-translate-x-full"
              }`
            : `sticky top-0 h-screen border-r bg-background ${open ? "w-64" : "w-16"}`
        }`}
      >
        <AppSidebar />
      </div>

      {/* Main content */}
      <SidebarInset
        className={`flex flex-col flex-1 transition-all duration-300 ${
          !isMobile && open ? "ml-2" : !isMobile ? "ml-2" : "ml-0"
        }`}
      >
        {/* Toggle button */}
        <div className="p-4 border-b flex items-center justify-start">
          <SidebarTrigger onClick={toggleSidebar} />
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto md:p-6">
          <SectionCards />
          <div className="mt-4">
            <ChartAreaInteractive />
          </div>
          <div className="mt-4">
            <DataTable data={data} />
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}

export default function Page() {
  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "20rem" } as React.CSSProperties}>
      <PageContent />
    </SidebarProvider>
  )
}


// "use client"

// import { AppSidebar } from "@/components/app-sidebar"
// import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
// import { SectionCards } from "@/components/section-cards"
// import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

// import data from "./data.json"

// function PageContent() {
//   const { open, isMobile } = useSidebar() // access sidebar state and detect mobile

//   return (
//     <div className="flex w-full">
//       {/* Sidebar for desktop: sticky/fixed, overlay for mobile */}
//       {open && (
//         <div
//           className={`${
//             isMobile ? "fixed top-0 left-0 z-50 h-screen w-80 bg-background shadow-lg" : "sticky top-0 h-screen w-80 border-r bg-background"
//           }`}
//         >
//           <AppSidebar variant="inset" className="h-full" />
//         </div>
//       )}

//       {/* Main content */}
//       <SidebarInset className="flex flex-col flex-auto">
//         {/* Toggle button above content */}
//         <div className="p-4 border-b flex items-center justify-start">
//           <SidebarTrigger />
//         </div>

//         <div className="flex-1 overflow-auto p-4 md:p-6">
//           <SectionCards />
//           <div className="mt-4">
//             <ChartAreaInteractive />
//           </div>
//           <div className="mt-4">
//             <DataTable data={data} />
//           </div>
//         </div>
//       </SidebarInset>
//     </div>
//   )
// }

// export default function Page() {
//   return (
//     <SidebarProvider
//       defaultOpen={false}
//       style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
//     >
//       <PageContent />
//     </SidebarProvider>
//   )
// }
