import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// TODO: Connecter plus tard un back d'events/forums type Heartbeat
// Pour l'instant, données mockées en attendant l'intégration

interface Conversation {
  id: string;
  activityName: string;
  activityType: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isFromClub: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    activityName: "Club de basket",
    activityType: "Sport",
    lastMessage: "Prochain entraînement mercredi à 18h",
    lastMessageDate: "Il y a 2h",
    unreadCount: 1
  },
  {
    id: "2",
    activityName: "Atelier Théâtre",
    activityType: "Culture",
    lastMessage: "N'oubliez pas les costumes pour samedi !",
    lastMessageDate: "Hier",
    unreadCount: 0
  },
  {
    id: "3",
    activityName: "Stage de foot",
    activityType: "Sport",
    lastMessage: "Liste du matériel nécessaire envoyée",
    lastMessageDate: "Il y a 3 jours",
    unreadCount: 0
  }
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: "Club de basket",
      content: "Bonjour ! Le prochain entraînement aura lieu mercredi à 18h. N'oubliez pas vos baskets !",
      timestamp: "Il y a 2h",
      isFromClub: true
    },
    {
      id: "m2",
      sender: "Vous",
      content: "Merci pour l'info ! Mon fils sera présent.",
      timestamp: "Il y a 1h",
      isFromClub: false
    }
  ],
  "2": [
    {
      id: "m3",
      sender: "Atelier Théâtre",
      content: "N'oubliez pas les costumes pour la représentation de samedi !",
      timestamp: "Hier",
      isFromClub: true
    }
  ]
};

export const MessagesSection = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (selectedConversation) {
    const messages = mockMessages[selectedConversation] || [];
    const conversation = mockConversations.find(c => c.id === selectedConversation);

    return (
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                aria-label="Retour aux conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-xl">{conversation?.activityName}</CardTitle>
                <CardDescription>
                  Ici, tu échanges directement avec ton club ou ton association : infos pratiques, questions, petits messages avant ou après l'activité.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Pas encore de messages</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromClub ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isFromClub
                            ? 'bg-muted'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{message.sender}</p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            <Separator className="my-4" />
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Écris ton message..."
                className="flex-1 px-3 py-2 border rounded-md bg-background"
                disabled
              />
              <Button disabled>Envoyer</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              La messagerie sera bientôt disponible
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Messages avec mon club / asso
        </h2>
        <p className="text-muted-foreground">
          Ici, tu échanges directement avec ton club ou ton association : infos pratiques, questions, petits messages avant ou après l'activité.
        </p>
      </div>

      <div className="grid gap-4">
        {mockConversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Pas encore de conversations
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les messages apparaîtront ici quand tu seras inscrit à une activité
              </p>
            </CardContent>
          </Card>
        ) : (
          mockConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{conversation.activityName}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {conversation.activityType}
                      </Badge>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-1">
                      {conversation.lastMessage}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.lastMessageDate}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      <p className="text-xs text-muted-foreground italic">
        💡 La messagerie complète sera disponible prochainement pour échanger en temps réel avec les structures.
      </p>
    </section>
  );
};
