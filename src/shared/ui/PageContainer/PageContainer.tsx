import type { PropsWithChildren } from "react";

import "./PageContainer.css";

export function PageContainer({ children }: PropsWithChildren) {
  return <div className="page-container">{children}</div>;
}
