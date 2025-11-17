import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Info, Coins, Route, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedTab {
  id: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
  badge?: boolean | string;
}

interface EnhancedTabsProps {
  /**
   * Configuration des tabs
   */
  tabs: EnhancedTab[];

  /**
   * Tab active par défaut
   */
  defaultTab?: string;

  /**
   * Callback lors du changement de tab
   */
  onTabChange?: (tabId: string) => void;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

/**
 * Tabs améliorées avec icônes et design moderne
 *
 * Features:
 * - Icons pour chaque tab
 * - Badge notification optionnel
 * - Design moderne avec animations
 * - Scroll horizontal mobile-friendly
 *
 * @example
 * ```tsx
 * <EnhancedTabs
 *   tabs={[
 *     {
 *       id: "infos",
 *       label: "À propos",
 *       icon: FileText,
 *       content: <AboutContent />
 *     },
 *     {
 *       id: "aids",
 *       label: "Aides",
 *       icon: Coins,
 *       badge: true,
 *       content: <AidsContent />
 *     }
 *   ]}
 *   defaultTab="infos"
 * />
 * ```
 */
export function EnhancedTabs({
  tabs,
  defaultTab,
  onTabChange,
  className = ""
}: EnhancedTabsProps) {
  const initialTab = defaultTab || tabs[0]?.id || "";

  return (
    <Tabs
      defaultValue={initialTab}
      className={`enhanced-tabs w-full ${className}`}
      onValueChange={onTabChange}
    >
      {/* Tabs Header avec scroll horizontal */}
      <div className="bg-gray-50 rounded-lg p-1 mb-6 overflow-x-auto scrollbar-hide">
        <TabsList className="inline-flex w-full min-w-max bg-transparent gap-1 h-auto p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-lg
                bg-white border-2 border-transparent
                text-sm font-medium text-gray-600
                whitespace-nowrap
                transition-all duration-200
                hover:bg-gray-100
                data-[state=active]:bg-orange-50
                data-[state=active]:border-primary
                data-[state=active]:text-primary
                data-[state=active]:font-semibold
                data-[state=active]:shadow-sm
              "
            >
              <tab.icon size={18} className="flex-shrink-0" />
              <span>{tab.label}</span>

              {/* Badge notification */}
              {tab.badge && (
                <Badge
                  className="ml-1 h-5 px-1.5 text-xs font-bold bg-green-500 text-white border-0"
                >
                  {typeof tab.badge === "string" ? tab.badge : "•"}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Tabs Content */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="animate-in fade-in-50 duration-200">
            {tab.content}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

/**
 * Configuration pré-définie des tabs pour une page activité standard
 */
export const createActivityTabs = (props: {
  aboutContent: ReactNode;
  practicalInfoContent: ReactNode;
  financialAidContent?: ReactNode;
  mobilityContent?: ReactNode;
  hasApplicableAids?: boolean;
}): EnhancedTab[] => {
  const tabs: EnhancedTab[] = [
    {
      id: "infos",
      label: "À propos",
      icon: FileText,
      content: props.aboutContent
    },
    {
      id: "practical",
      label: "Infos pratiques",
      icon: Info,
      content: props.practicalInfoContent
    }
  ];

  // Ajouter tab Aides financières si fournie
  if (props.financialAidContent) {
    tabs.push({
      id: "aids",
      label: "Aides",
      icon: Coins,
      badge: props.hasApplicableAids,
      content: props.financialAidContent
    });
  }

  // Ajouter tab Mobilité si fournie
  if (props.mobilityContent) {
    tabs.push({
      id: "mobility",
      label: "Mobilité",
      icon: Route,
      content: props.mobilityContent
    });
  }

  return tabs;
};
