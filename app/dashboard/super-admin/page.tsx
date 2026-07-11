import { createClient } from '@/utils/supabase/server';

export default async function WelcomeUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    let displayName = '';
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('nama_lengkap')
            .eq('id', user.id)
            .single();

        displayName = userData?.nama_lengkap || user.email;
    }

    return (
        <>
            {user && (
                <p>
                    Selamat datang kembali,{' '}
                    <span className="font-medium text-emerald-600">{displayName}</span>
                </p>
            )}
        </>
    );
}