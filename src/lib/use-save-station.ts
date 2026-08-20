import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toggleSavedStation } from "@/lib/saved";
import { useFinder } from "@/store/finder";

export function useSaveStation() {
  const toggleSaved = useFinder((s) => s.toggleSaved);
  const { user } = useCurrentUserState();

  return (id: string) => {
    toggleSaved(id);
    if (user) {
      void toggleSavedStation({ data: id }).catch(() => {
        /* keep the local bookmark even if sync fails */
      });
    }
  };
}
