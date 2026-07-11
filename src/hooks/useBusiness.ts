import { useQuery } from "@tanstack/react-query";
import type { BusinessSettings } from "@/types/settings";

export function useBusiness() {
  return useQuery<BusinessSettings>({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const response = await fetch("/api/github/read?path=settings/business");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    staleTime: 60_000,
  });
}
