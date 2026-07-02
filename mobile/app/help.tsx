import * as React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { SubHeader, Field, Button, Card } from '@/components/ui';
import { roame } from '@/lib/api';
import { useSession } from '@/lib/session';

interface Faq {
  id: string;
  question: string;
  answer: string;
}

export default function Help() {
  const { user } = useSession();
  const [faqs, setFaqs] = React.useState<Faq[]>([]);
  const [open, setOpen] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    roame.faqs().then((r) => setFaqs(r.data)).catch(() => {});
  }, []);

  async function submit() {
    if (!user) return router.push('/sign-in');
    setPending(true);
    try {
      await roame.supportTicket(subject.trim(), message.trim());
      Alert.alert('Ticket created', "We'll get back to you soon.");
      setSubject('');
      setMessage('');
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background" edges={['top']}>
      <SubHeader title="Help & support" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        {faqs.length > 0 ? (
          <View className="gap-2.5">
            <Text className="text-[17px] font-bold text-foreground">FAQs</Text>
            {faqs.map((f) => {
              const isOpen = open === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setOpen(isOpen ? null : f.id)}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-[15px] font-semibold text-foreground">{f.question}</Text>
                    {isOpen ? <ChevronUp color="#71717A" size={18} /> : <ChevronDown color="#71717A" size={18} />}
                  </View>
                  {isOpen ? <Text className="mt-2 text-[14px] leading-5 text-muted">{f.answer}</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Card className="gap-4">
          <Text className="text-[17px] font-bold text-foreground">Contact us</Text>
          <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="What do you need help with?" />
          <Field
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more…"
            multiline
            style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
          />
          <Button
            label="Submit ticket"
            loading={pending}
            disabled={subject.trim().length < 3 || message.trim().length < 1}
            onPress={submit}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
