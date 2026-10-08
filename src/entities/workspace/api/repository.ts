import { createMockRepository } from "@/shared/api/repositories";
import type { Repository } from "@/shared/api/types";

import { workspaceMockResponse } from "@/entities/workspace/mocks/data";
import type { WorkspaceResponse } from "@/entities/workspace/model/types";

export const workspaceRepository: Repository<void, WorkspaceResponse> =
  createMockRepository(async () => workspaceMockResponse);
