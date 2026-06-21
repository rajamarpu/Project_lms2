import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
import { platformApi } from '@/api/platform.api';

type Verification = { verificationId: string; learner: string; course: string; issuedAt: string; expiresAt?: string };
export default function VerifyCertificate() {
  const { verificationId } = useParams<{ verificationId: string }>(); const [data, setData] = useState<Verification | null>(null); const [loading, setLoading] = useState(true); const [invalid, setInvalid] = useState(false);
  useEffect(() => { platformApi.verifyCertificate(verificationId!).then(({ data: response }) => setData(response.data)).catch(() => setInvalid(true)).finally(() => setLoading(false)); }, [verificationId]);
  if (loading) return <div className="grid min-h-[60vh] place-items-center" role="status"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="sr-only">Verifying certificate</span></div>;
  return <div className="container max-w-2xl py-16"><article className="glass-card p-8 text-center">{invalid || !data ? <><ShieldX className="mx-auto h-14 w-14 text-destructive" /><h1 className="mt-4 font-display text-3xl font-bold">Certificate not valid</h1><p className="mt-3 text-muted-foreground">This credential does not exist, has not been issued, or was revoked.</p></> : <><ShieldCheck className="mx-auto h-14 w-14 text-secondary" /><Award className="mx-auto mt-4 h-8 w-8 text-primary" /><h1 className="mt-3 font-display text-3xl font-bold">Verified certificate</h1><p className="mt-5 text-lg"><strong>{data.learner}</strong> completed <strong>{data.course}</strong>.</p><p className="mt-2 text-sm text-muted-foreground">Issued {new Date(data.issuedAt).toLocaleDateString()}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{data.verificationId}</p></>}<Link to="/courses" className="btn-outline-teal mt-7 inline-flex">Explore courses</Link></article></div>;
}
