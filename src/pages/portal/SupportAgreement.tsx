import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Download, FileSignature, Loader2, RotateCcw, Save, Sparkles } from "lucide-react";
import jsPDF from "jspdf";
import SignaturePad from "@/components/clinical/SignaturePad";
import {
  DEFAULT_SUPPORT_AGREEMENT_TEMPLATE,
  applyTemplateVars,
  type AgreementVars,
} from "@/lib/supportAgreementTemplate";

interface Agreement {
  id: string;
  client_id: string;
  title: string;
  body: string;
  status: string;
  signed_name: string;
  signature_data_url: string;
  signed_at: string | null;
  signed_pdf_url: string;
}

const SupportAgreement = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [params] = useSearchParams();
  const queryClientId = params.get("client");

  const [clientId, setClientId] = useState<string | null>(null);
  const [vars, setVars] = useState<AgreementVars>({});
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [body, setBody] = useState("");
  const [signedName, setSignedName] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Resolve which client this page is for: staff can pass ?client=, otherwise self.
  useEffect(() => {
    if (!user) return;
    if (queryClientId && isStaff) setClientId(queryClientId);
    else setClientId(user.id);
  }, [user, queryClientId, isStaff]);

  const isOwnAgreement = clientId === user?.id;
  const canEdit = isAdmin || (isStaff && !isOwnAgreement);
  const canSign = isOwnAgreement || canEdit; // staff may sign on behalf with parent present

  const load = async () => {
    if (!clientId) return;
    setLoading(true);

    // Pull profile extras for prefill
    const { data: extras } = await supabase
      .from("client_profile_extras")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    const v: AgreementVars = {
      parent_name: extras?.parent_name,
      child_name: extras?.child_name,
      date_of_birth: extras?.date_of_birth ?? undefined,
      diagnosis: extras?.diagnosis,
      client_email: extras?.email,
      client_phone: extras?.phone,
    };
    setVars(v);

    // Existing agreement?
    const { data: agr } = await supabase
      .from("support_agreements")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();

    if (agr) {
      setAgreement(agr as Agreement);
      setBody(agr.body || applyTemplateVars(DEFAULT_SUPPORT_AGREEMENT_TEMPLATE, v));
      setSignedName(agr.signed_name || "");
      setSignature(agr.signature_data_url || "");
    } else {
      setAgreement(null);
      setBody(applyTemplateVars(DEFAULT_SUPPORT_AGREEMENT_TEMPLATE, v));
      setSignedName(v.parent_name || "");
      setSignature("");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (clientId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const refillFromProfile = () => {
    setBody(applyTemplateVars(DEFAULT_SUPPORT_AGREEMENT_TEMPLATE, vars));
    toast.success("Reset to template with profile details");
  };

  const saveDraft = async () => {
    if (!clientId) return;
    setSaving(true);
    const payload: any = {
      client_id: clientId,
      title: "Support Agreement",
      body,
      status: agreement?.status === "signed" ? "signed" : "draft",
      created_by: user?.id,
    };
    const { data, error } = await supabase
      .from("support_agreements")
      .upsert(payload, { onConflict: "client_id" })
      .select()
      .maybeSingle();
    setSaving(false);
    if (error) return toast.error(error.message);
    if (data) setAgreement(data as Agreement);
    toast.success("Draft saved");
  };

  const buildPdf = (signedNameVal: string, signatureVal: string) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Support Agreement", margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(body, maxWidth);
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin - 120) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    });

    // Signature block
    if (y > doc.internal.pageSize.getHeight() - margin - 140) {
      doc.addPage();
      y = margin;
    }
    y += 24;
    doc.setDrawColor(180);
    doc.line(margin, y, margin + 220, y);
    y += 14;
    doc.setFontSize(10);
    doc.text("Signed by:", margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(signedNameVal || "—", margin + 60, y);
    doc.setFont("helvetica", "normal");
    y += 14;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 18;

    if (signatureVal) {
      try {
        doc.addImage(signatureVal, "PNG", margin, y, 200, 70);
      } catch {
        // ignore image failure
      }
    }
    return doc;
  };

  const downloadPdf = () => {
    const doc = buildPdf(agreement?.signed_name || signedName, agreement?.signature_data_url || signature);
    doc.save(`support-agreement-${clientId}.pdf`);
  };

  const finalizeAndSign = async () => {
    if (!clientId) return;
    if (!signedName.trim()) return toast.error("Please type the signer's full name");
    if (!signature) return toast.error("Please add a signature");
    setSigning(true);

    // 1. Build PDF
    const doc = buildPdf(signedName, signature);
    const pdfBlob = doc.output("blob");
    const path = `${clientId}/agreement-${Date.now()}.pdf`;

    // 2. Upload signed PDF
    const { error: upErr } = await supabase.storage
      .from("support-agreements")
      .upload(path, pdfBlob, { contentType: "application/pdf", upsert: true });
    if (upErr) {
      setSigning(false);
      return toast.error(upErr.message);
    }

    // 3. Persist record
    const payload: any = {
      client_id: clientId,
      title: "Support Agreement",
      body,
      status: "signed",
      signed_name: signedName,
      signature_data_url: signature,
      signed_at: new Date().toISOString(),
      signed_pdf_url: path,
      created_by: user?.id,
    };
    const { data, error } = await supabase
      .from("support_agreements")
      .upsert(payload, { onConflict: "client_id" })
      .select()
      .maybeSingle();

    // 4. Mark pathway step complete (best effort)
    await supabase
      .from("client_pathway_steps")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("step_type", "agreement");

    setSigning(false);
    if (error) return toast.error(error.message);
    if (data) setAgreement(data as Agreement);
    toast.success("Agreement signed");
  };

  const downloadSignedFromStorage = async () => {
    if (!agreement?.signed_pdf_url) return;
    const { data, error } = await supabase.storage
      .from("support-agreements")
      .createSignedUrl(agreement.signed_pdf_url, 60);
    if (error || !data) return toast.error(error?.message ?? "Could not load PDF");
    window.open(data.signedUrl, "_blank");
  };

  const previewLines = useMemo(() => body.split("\n"), [body]);
  const isSigned = agreement?.status === "signed";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-20">
        <div className="container max-w-5xl">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Support Agreement
                {isSigned && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">Signed</Badge>}
                {!isSigned && agreement && <Badge variant="outline">Draft</Badge>}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {canEdit
                  ? "Edit the contract, then capture the family's signature in person or send the link to the client."
                  : "Review the agreement, type your name, sign in the box, and we'll generate a PDF for your records."}
              </p>
            </div>
            <Link to={isOwnAgreement ? "/portal/support-pathway" : `/admin/clients/${clientId}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Back to pathway
            </Link>
          </div>

          {loading ? (
            <Card className="p-10 text-center text-muted-foreground">Loading agreement…</Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Editor / template */}
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Contract text</h2>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="gap-2" onClick={refillFromProfile}>
                        <RotateCcw size={14} /> Reset from template
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" onClick={saveDraft} disabled={saving}>
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save draft
                      </Button>
                    </div>
                  )}
                </div>
                {canEdit ? (
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={22}
                    className="font-mono text-xs leading-relaxed"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground italic">
                    Only your therapist can change the wording. Read the document on the right and sign below.
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Auto-fill placeholders: <code>{"{{parent_name}} {{child_name}} {{date_of_birth}} {{diagnosis}} {{client_email}} {{client_phone}} {{today}}"}</code>
                </p>
              </Card>

              {/* Preview + sign */}
              <div className="space-y-6">
                <Card className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" /> Live preview
                    </h2>
                    <Button size="sm" variant="outline" className="gap-2" onClick={downloadPdf}>
                      <Download size={14} /> PDF
                    </Button>
                  </div>
                  <div
                    ref={previewRef}
                    className="rounded-lg border border-border bg-muted/30 p-4 max-h-[420px] overflow-auto text-[12px] leading-relaxed whitespace-pre-wrap font-serif"
                  >
                    {previewLines.map((line, i) => (
                      <div key={i}>{line || "\u00A0"}</div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 space-y-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <FileSignature size={16} className="text-primary" /> Signature
                  </h2>

                  {isSigned ? (
                    <div className="space-y-3 text-sm">
                      <div className="rounded-lg border border-border bg-muted/30 p-3">
                        <div><span className="text-muted-foreground">Signed by:</span> <strong>{agreement?.signed_name}</strong></div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {agreement?.signed_at && new Date(agreement.signed_at).toLocaleString()}
                        </div>
                        {agreement?.signature_data_url && (
                          <img
                            src={agreement.signature_data_url}
                            alt="signature"
                            className="mt-3 max-h-24 bg-white rounded border border-border p-2"
                          />
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {agreement?.signed_pdf_url && (
                          <Button variant="default" className="gap-2" onClick={downloadSignedFromStorage}>
                            <Download size={14} /> Open signed PDF
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (!agreement) return;
                              const { error } = await supabase
                                .from("support_agreements")
                                .update({ status: "draft", signature_data_url: "", signed_at: null, signed_pdf_url: "" })
                                .eq("id", agreement.id);
                              if (error) toast.error(error.message);
                              else { toast.success("Reset to draft"); load(); }
                            }}
                          >
                            Reopen for editing
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {canSign ? (
                        <>
                          <div>
                            <label className="text-xs text-muted-foreground">Full name of signer</label>
                            <Input
                              value={signedName}
                              onChange={(e) => setSignedName(e.target.value)}
                              placeholder="e.g. Jane Doe"
                              className="mt-1"
                            />
                          </div>
                          <SignaturePad value={signature} onChange={setSignature} />
                          <Button
                            className="w-full rounded-full gap-2"
                            onClick={finalizeAndSign}
                            disabled={signing || !signedName || !signature}
                          >
                            {signing ? <Loader2 size={14} className="animate-spin" /> : <FileSignature size={14} />}
                            Sign and generate PDF
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Waiting for the family to sign.
                        </p>
                      )}
                    </>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SupportAgreement;
