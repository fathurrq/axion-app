import { redirect } from 'next/navigation';

export default async function InvitePage(props: { params: Promise<{ orgId: string }> }) {
    const params = await props.params;
    const orgId = params.orgId;

    // Fetch organization info from backend API directly
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/organizations/${orgId}`, { cache: 'no-store' });

    if (!res.ok) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold">Organization Not Found</h1>
                    <p className="text-gray-400">The invite link might be invalid or expired.</p>
                </div>
            </div>
        );
    }

    const org = await res.json();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-white p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-center">
                <h1 className="text-3xl font-bold text-white">You're invited!</h1>
                <p className="text-gray-400">
                    You have been invited to join the organization:
                </p>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-2">
                    <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                        {org.name}
                    </h2>
                    {org.members && (
                        <p className="text-sm text-slate-400">
                            {org.members.length} members
                        </p>
                    )}
                </div>

                <div className="space-y-3 pt-4">
                    <a
                        href={`/auth/login?returnTo=/invite/${orgId}/accept`}
                        className="block w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Accept Invite & Login
                    </a>
                </div>
            </div>
        </div>
    );
}
