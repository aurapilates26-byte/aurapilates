import { revalidatePath } from "next/cache";

/** Rafraîchit la section packs du site public après une modification de remise. */
export function revalidatePublicPacks() {
  revalidatePath("/");
}
