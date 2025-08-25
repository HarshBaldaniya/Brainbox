"use clinet";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment, useEffect, useState } from "react";
import { doc } from "firebase/firestore";
import { db } from "@/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";

function Breadcrumbs() {
  const path = usePathname();
  const segments = path.split("/").filter(Boolean);
  const [title, setTitle] = useState<string | null>(null);
  const lastSegmentId = segments[segments.length - 1];

  const documentRef = lastSegmentId ? doc(db, "documents", lastSegmentId) : null;
  const [data, loading] = useDocumentData(documentRef);

  useEffect(() => {
    if (data && data.title) {
      setTitle(data.title);
    }
  }, [data]);

  return (
    <Breadcrumb className="hidden md:flex items-center space-x-2">
      <BreadcrumbList className="flex items-center">
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="text-sm md:text-base">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          if (!segment) return null;

          const isLast = index === segments.length - 1;
          const isSecondLast = index === segments.length - 2;
          if (isSecondLast && segment === "doc") return null;
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          return (
            <Fragment key={segment}>
              <BreadcrumbSeparator className="mx-1 md:mx-2 text-gray-500" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage
                    className="font-semibold text-sm md:text-base text-black truncate max-w-[160px]"
                    title={title || segment} 
                  >
                    {loading ? "Loading..." : title || segment}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={href}
                    className="text-sm md:text-base text-gray-600 hover:text-black"
                  >
                    {segment}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
export default Breadcrumbs;
