import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ParentValidationEmailProps {
  childName: string;
  childDob: string;
  validationUrl: string;
  rejectUrl: string;
}

export const ParentValidationEmail = ({
  childName,
  childDob,
  validationUrl,
  rejectUrl,
}: ParentValidationEmailProps) => (
  <Html>
    <Head />
    <Preview>{childName} souhaite s'inscrire sur InKlusif</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎯 Demande d'inscription</Heading>
        
        <Text style={text}>
          Bonjour,
        </Text>
        
        <Text style={text}>
          <strong>{childName}</strong> (né(e) le <strong>{new Date(childDob).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>) 
          a demandé à s'inscrire sur InKlusif pour accéder aux activités.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>🔍 Vérifiez l'identité</Text>
          <Text style={infoText}>
            • Prénom : {childName}<br />
            • Date de naissance : {new Date(childDob).toLocaleDateString('fr-FR')}
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Button
            href={validationUrl}
            style={buttonPrimary}
          >
            ✅ OUI, C'EST MON ENFANT
          </Button>
          
          <Button
            href={rejectUrl}
            style={buttonSecondary}
          >
            ❌ NON, REFUSER
          </Button>
        </Section>

        <Text style={warningText}>
          ⚠️ Si vous ne reconnaissez pas cette demande, cliquez sur "NON, REFUSER" 
          ou ignorez simplement cet email.
        </Text>

        <Text style={expiryText}>
          Cette demande expirera automatiquement dans 48 heures.
        </Text>

        <Text style={footer}>
          InKlusif - Activités jeunesse<br />
          Cet email a été envoyé car votre adresse email a été utilisée lors d'une demande d'inscription.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ParentValidationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 20px 20px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 20px',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  margin: '24px 20px',
  padding: '16px',
};

const infoTitle = {
  color: '#495057',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const infoText = {
  color: '#495057',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 20px',
};

const buttonPrimary = {
  backgroundColor: '#5469d4',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px',
  marginBottom: '12px',
};

const buttonSecondary = {
  backgroundColor: '#ffffff',
  border: '2px solid #dc3545',
  borderRadius: '8px',
  color: '#dc3545',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px',
};

const warningText = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  fontSize: '14px',
  lineHeight: '20px',
  padding: '12px',
  margin: '24px 20px',
};

const expiryText = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 20px',
  fontStyle: 'italic' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '32px',
  textAlign: 'center' as const,
  padding: '0 20px',
};
