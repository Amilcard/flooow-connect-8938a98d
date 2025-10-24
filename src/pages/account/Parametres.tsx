import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { useToast } from '@/hooks/use-toast';
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

	const changePassword = () => {
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
		if (passwordForm.newPassword.length < 8) {
			toast({
				title: 'Erreur',
				description: 'Le mot de passe doit contenir au moins 8 caractères.',
				variant: 'destructive',
			});
			return;
		}
		setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
		setShowPasswordDialog(false);
		toast({
			title: 'Mot de passe mis à jour',
			description: 'Votre mot de passe a été modifié avec succès.',
		});
	};

	const exportData = () =>
		toast({ title: 'Export en cours', description: 'Vos données seront téléchargées sous peu.' });
	const deleteAccount = () => {
		toast({
			title: 'Suppression programmée',
			description: 'Votre compte sera supprimé dans 30 jours.',
			variant: 'destructive',
		});
		setShowDeleteDialog(false);
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
				<DataManagement onExport={exportData} onDelete={deleteAccount} />
			</div>
		</PageLayout>
	);
};

export default Parametres;
