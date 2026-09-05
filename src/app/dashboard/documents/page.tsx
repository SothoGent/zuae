import { DocumentsManager } from "@/components/documents-manager";
import { Reveal } from "@/components/motion";
import { IconShield } from "@/components/icons";

export const metadata = { title: "Document vault" };

export default function DocumentsPage() {
  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-zim-green uppercase">Step 2 of the journey</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-navy-900">Document vault</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Upload once, apply everywhere. Files are stored in a private per-student vault (organised as{" "}
              <code className="font-semibold">user_id/documents/…</code>) and only you plus your assigned ZUAE
              officer can open them.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg border border-zim-green/40 bg-zim-green/10 px-4 py-2 text-xs font-bold text-zim-green">
            <IconShield className="h-4 w-4" /> Encrypted · private · verified by staff
          </span>
        </div>
      </Reveal>
      <div className="mt-8">
        <DocumentsManager />
      </div>
    </div>
  );
}
