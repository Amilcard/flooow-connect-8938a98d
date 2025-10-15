import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  return (
    <PageLayout>
      <main className="container px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Contact</h1>
        <p className="text-sm text-muted-foreground mb-4">Une question ? Écrivez-nous.</p>

        <Card>
          <CardHeader>
            <CardTitle>Envoyer un message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button onClick={() => alert('Message envoyé (mock)')}>Envoyer</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </PageLayout>
  );
};

export default Contact;
