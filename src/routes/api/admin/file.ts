import { createFileRoute } from "@tanstack/react-router";
import { bad, env, requireAdmin } from "@/server/vault";

// Scarica un file dell'archivio (foto cliente, illustrazione). Solo admin.
export const Route = createFileRoute("/api/admin/file")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const deny = await requireAdmin(request);
        if (deny) return deny;
        const url = new URL(request.url);
        const key = url.searchParams.get("key") ?? "";
        if (!key.startsWith("ordini/")) return bad("File non valido");
        const obj = await env.FILES.get(key);
        if (!obj) return bad("File non trovato", 404);
        const name = key.split("/").pop() ?? "file";
        const headers: Record<string, string> = {
          "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
          "cache-control": "private, max-age=3600",
        };
        if (url.searchParams.get("download"))
          headers["content-disposition"] = `attachment; filename="${name.replace(/"/g, "")}"`;
        return new Response(obj.body, { headers });
      },
    },
  },
});
