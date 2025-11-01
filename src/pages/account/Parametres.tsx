import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AppearanceSettings from '@/components/account/AppearanceSettings';
import SecuritySettings from '@/components/account/SecuritySettings';
import PrivacySettings from '@/components/account/PrivacySettings';
import DataManagement from '@/components/account/DataManagement';
import { SettingsType } from '@/components/account/types';

const Parametres: React.FC = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [settings, setSettings] = useState<SettingsType>({
		language: 'fr',
		region: 'FR',
		theme: 'system',
		fontSize: 'medium',
		highContrast: false,
		reducedMotion: false,
		profileVisibility: 'friends',
		dataSharing: false,
		analytics: true,
		cookies: true,
		pushNotifications: true,
		emailNotifications: true,
		soundEnabled: true,
		twoFactorAuth: false,
		sessionTimeout: '30',
		screenReader: false,
		voiceOver: false,
		largeText: false,
		colorBlindMode: false,
	});

	const [showPasswordDialog, setShowPasswordDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const updateSetting = <K extends keyof SettingsType>(
		key: K,
		value: SettingsType[K]
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		toast({
			title: 'Paramètre mis à jour',
			description: 'Vos préférences ont été sauvegardées.',
		});
	};

	const changePassword = async () => {
		// Validation des champs
		if (
			!passwordForm.currentPassword ||
			!passwordForm.newPassword ||
			!passwordForm.confirmPassword
		) {
			toast({
				title: 'Erreur',
				description: 'Veuillez remplir tous les champs.',
				variant: 'destructive',
			});
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast({
				title: 'Erreur',
				description: 'Les mots de passe ne correspondent pas.',
				variant: 'destructive',
			});
			return;
		}

		// Validation force du mot de passe
		if (passwordForm.newPassword.length < 8) {
			toast({
				title: 'Erreur',
				description: 'Le mot de passe doit contenir au moins 8 caractères.',
				variant: 'destructive',
			});
			return;
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
		if (!passwordRegex.test(passwordForm.newPassword)) {
			toast({
				title: 'Mot de passe trop faible',
				description: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
				variant: 'destructive',
			});
			return;
		}

		try {
			// Vérifier l'authentification actuelle
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: 'Erreur',
					description: 'Vous devez être connecté pour changer votre mot de passe.',
					variant: 'destructive',
				});
				navigate('/login');
				return;
			}

			// Mettre à jour le mot de passe via Supabase
			const { error } = await supabase.auth.updateUser({
				password: passwordForm.newPassword
			});

			if (error) {
				throw error;
			}

			// Succès
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setShowPasswordDialog(false);
			toast({
				title: 'Mot de passe mis à jour',
				description: 'Votre mot de passe a été modifié avec succès.',
			});
		} catch (error: any) {
			console.error('Password change error:', error);
			toast({
				title: 'Erreur',
				description: error.message || 'Impossible de changer le mot de passe.',
				variant: 'destructive',
			});
		}
	};

	const exportData = async () => {
		try {
			toast({
				title: 'Préparation de l\'export',
				description: 'Récupération de vos données...'
			});

			const { data, error } = await supabase.functions.invoke('export-user-data', {
				method: 'GET'
			});

			if (error) {
				throw error;
			}

			// Create blob and download
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `inklusif-export-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast({
				title: 'Export réussi',
				description: 'Vos données ont été téléchargées avec succès.'
			});
		} catch (error: any) {
			console.error('Export error:', error);
			toast({
				title: 'Erreur',
				description: error.message || 'Impossible d\'exporter vos données.',
				variant: 'destructive'
			});
		}
	};
	const deleteAccount = async () => {
		try {
			const { data, error } = await supabase.functions.invoke('delete-account', {
				method: 'POST',
				body: {
					action: 'schedule',
					reason: 'user_request'
				}
			});

			if (error) {
				throw error;
			}

			// Check for active bookings error
			if (data.error === 'active_bookings') {
				toast({
					title: 'Réservations actives',
					description: data.message,
					variant: 'destructive',
				});
				setShowDeleteDialog(false);
				return;
			}

			// Success
			setShowDeleteDialog(false);
			toast({
				title: 'Suppression programmée',
				description: data.message || 'Votre compte sera supprimé dans 30 jours.',
				variant: 'destructive',
			});

			// Optionally redirect to a confirmation page
			// navigate('/account-deletion-scheduled');
		} catch (error: any) {
			console.error('Delete account error:', error);
			toast({
				title: 'Erreur',
				description: error.message || 'Impossible de supprimer votre compte.',
				variant: 'destructive',
			});
			setShowDeleteDialog(false);
		}
	};

	const deactivateAccount = async () => {
		try {
			const { data, error } = await supabase.functions.invoke('delete-account', {
				method: 'POST',
				body: {
					action: 'deactivate',
					reason: 'user_request'
				}
			});

			if (error) {
				throw error;
			}

			// Success
			setShowDeactivateDialog(false);
			toast({
				title: 'Compte désactivé',
				description: data.message || 'Votre compte a été désactivé. Vous pouvez le réactiver en vous reconnectant.',
				variant: 'default',
			});

			// Optionally logout user
			setTimeout(() => {
				navigate('/login');
			}, 2000);
		} catch (error: any) {
			console.error('Deactivate account error:', error);
			toast({
				title: 'Erreur',
				description: error.message || 'Impossible de désactiver votre compte.',
				variant: 'destructive',
			});
			setShowDeactivateDialog(false);
		}
	};

	return (
		<PageLayout showHeader={false}>
			<div className="bg-gradient-to-r from-primary to-accent text-white p-4">
				<div className="container flex items-center space-x-4">
					<BackButton fallback="/mon-compte" variant="ghost" size="sm" className="text-white hover:bg-white/20" />
					<div>
						<h1 className="text-xl font-bold">Paramètres</h1>
						<p className="text-white/90 text-sm">Personnalisez votre expérience</p>
					</div>
				</div>
			</div>

			<div className="container px-4 py-6 space-y-6">
				<AppearanceSettings settings={settings} updateSetting={updateSetting} />
				<SecuritySettings
					settings={settings}
					updateSetting={updateSetting}
					showPasswordDialog={showPasswordDialog}
					setShowPasswordDialog={setShowPasswordDialog}
					passwordForm={passwordForm}
					setPasswordForm={setPasswordForm}
					changePassword={changePassword}
				/>
				<PrivacySettings settings={settings} updateSetting={updateSetting} />
				<DataManagement onExport={exportData} onDeactivate={deactivateAccount} onDelete={deleteAccount} />
			</div>
		</PageLayout>
	);
};

export default Parametres;
