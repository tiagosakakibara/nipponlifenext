"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, Check, X, User, AtSign, Mail, AlertCircle, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ProfilePageClient() {
    const t = useTranslations();
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // UI state
    // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
    const [usernameStatus, setUsernameStatus] = useState<string>('idle');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setUsername(profile.username || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?next=/perfil');
        }
    }, [user, authLoading, router]);

    // Username helpers
    const normalizeUsername = (value: string) => {
        return value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    };

    const getUsernameError = (value: string) => {
        if (value.length < 3) return t('auth.profile.errors.usernameTooShort');
        if (value.length > 20) return t('auth.profile.errors.usernameTooLong');
        if (!/^[a-z0-9._]+$/.test(value)) return t('auth.profile.errors.usernameInvalidChars');
        return null;
    };

    const checkUsername = useCallback(async (usernameToCheck: string) => {
        const normalized = normalizeUsername(usernameToCheck);
        const validationError = getUsernameError(normalized);

        if (validationError) {
            setUsernameStatus('invalid');
            return;
        }

        // Skip if it's the same as current
        if (normalized === profile?.username) {
            setUsernameStatus('available');
            return;
        }

        setUsernameStatus('checking');

        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', normalized)
            .neq('id', user?.id || '')
            .single();

        setUsernameStatus(data ? 'taken' : 'available');
    }, [user?.id, profile?.username, supabase]);

    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameStatus('idle');
            return;
        }

        const timer = setTimeout(() => {
            checkUsername(username);
        }, 500);

        return () => clearTimeout(timer);
    }, [username, checkUsername]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setUploading(true);

        try {
            // Use the centralized service which handles validation and correct bucket selection
            const { url, error } = await import('@/lib/profileService').then(m => m.uploadAvatar(user.id, file));

            if (error) {
                throw new Error(error);
            }

            if (url) {
                setAvatarUrl(url);
                toast.success(t('auth.profile.success.avatarUpdated'));
            }
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || t('auth.profile.errors.avatarUploadFailed'));
            setAvatarPreview(null); // Revert preview
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) return;

        const normalizedUsername = normalizeUsername(username);
        const usernameError = getUsernameError(normalizedUsername);

        if (usernameError) {
            toast.error(usernameError);
            return;
        }

        if (usernameStatus === 'taken') {
            toast.error(t('auth.profile.errors.usernameTaken'));
            return;
        }

        setSaving(true);

        try {
            const updates = {
                id: user.id,
                full_name: fullName.trim(),
                username: normalizedUsername,
                avatar_url: avatarUrl || undefined,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

            if (error) throw error;

            toast.success(t('auth.profile.success.profileUpdated'));
            router.refresh();
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                toast.error(t('auth.profile.errors.usernameTaken'));
                setUsernameStatus('taken');
            } else {
                console.error('Error updating profile:', error);
                toast.error(t('auth.profile.errors.updateFailed'));
            }
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (fullName) {
            return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (username) {
            return username[0].toUpperCase();
        }
        return 'U';
    };

    if (authLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D70F24]" />
                    <p className="text-muted">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
            <div className="bg-surface border border-app rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-app bg-gradient-to-r from-[#003768] to-[#5593C3]">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-white" />
                        <h1 className="text-xl font-bold text-white">{t('auth.profile.title')}</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-app shadow-md">
                                {avatarPreview || avatarUrl ? (
                                    <img
                                        src={avatarPreview || avatarUrl || ''}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#D70F24] flex items-center justify-center text-white text-2xl font-bold">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>

                            {/* Upload overlay */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-[#003768] hover:bg-[#002850] rounded-full flex items-center justify-center text-white transition-all shadow-lg transform group-hover:scale-110"
                            >
                                {uploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-muted text-xs">{t('auth.profile.avatarHint')}</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.profile.fullNameLabel')}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={t('auth.profile.fullNamePlaceholder')}
                                className="w-full px-4 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#D70F24]/30 focus:border-[#D70F24] transition-all"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.profile.usernameLabel')}
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                                    placeholder={t('auth.profile.usernamePlaceholder')}
                                    maxLength={20}
                                    className={`w-full pl-10 pr-10 py-2.5 border border-app rounded-xl bg-app text-primary placeholder:text-muted text-sm focus:outline-none focus:ring-2 transition-all ${usernameStatus === 'taken' || usernameStatus === 'invalid'
                                        ? 'focus:ring-red-500/30 focus:border-red-500 border-red-500/50'
                                        : 'focus:ring-[#D70F24]/30 focus:border-[#D70F24]'
                                        }`}
                                />
                                {/* Status indicator */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {usernameStatus === 'checking' && (
                                        <Loader2 className="w-4 h-4 text-muted animate-spin" />
                                    )}
                                    {usernameStatus === 'available' && (
                                        <Check className="w-4 h-4 text-green-500" />
                                    )}
                                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                                        <X className="w-4 h-4 text-[#D70F24]" />
                                    )}
                                </div>
                            </div>
                            {/* Status message */}
                            <div className="mt-1.5 text-xs min-h-[1rem]">
                                {usernameStatus === 'checking' && (
                                    <span className="text-muted">{t('auth.profile.status.checking')}</span>
                                )}
                                {usernameStatus === 'available' && (
                                    <span className="text-green-600">{t('auth.profile.status.available')}</span>
                                )}
                                {usernameStatus === 'taken' && (
                                    <span className="text-[#D70F24]">{t('auth.profile.errors.usernameTaken')}</span>
                                )}
                                {usernameStatus === 'invalid' && username.length >= 3 && (
                                    <span className="text-[#D70F24]">{getUsernameError(username)}</span>
                                )}
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">
                                {t('auth.profile.emailLabel')} <span className="text-muted text-xs">({t('common.readOnly')})</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 border border-app rounded-xl bg-gray-100 dark:bg-gray-800 text-muted text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-app">
                        <button
                            type="submit"
                            disabled={saving || usernameStatus === 'checking' || usernameStatus === 'taken'}
                            className="w-full sm:w-auto px-8 py-3 bg-[#D70F24] hover:bg-[#b80d1f] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('common.saving')}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('common.saveChanges')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
